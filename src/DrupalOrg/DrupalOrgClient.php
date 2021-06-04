<?php

namespace Drupal\project_browser\DrupalOrg;

use Composer\Semver\Comparator;
use Composer\Semver\VersionParser;
use Doctrine\Common\Cache\FilesystemCache;
use GuzzleHttp\Client;
use GuzzleHttp\HandlerStack;
use GuzzleHttp\TransferStats;
use Kevinrob\GuzzleCache\CacheMiddleware;
use Kevinrob\GuzzleCache\Storage\DoctrineCacheStorage;
use Kevinrob\GuzzleCache\Strategy\PrivateCacheStrategy;

/**
 * Retrieves releases and information about releases from Drupal.org.
 */
class DrupalOrgClient {

    /**
     * The Guzzle client.
     *
     * @var \GuzzleHttp\Client
     */
    protected $guzzleClient;

    /**
     * Setter for the Guzzle client.
     *
     * @param \GuzzleHttp\Client $client
     *   The Guzzle client.
     */
    public function setGuzzleClient(Client $client): void {
        $this->guzzleClient = $client;
    }

    /**
     * Getter for the Guzzle client.
     *
     * @return \GuzzleHttp\Client
     *   The HTTP Client.
     */
    public function getGuzzleClient(): Client {
        if (!isset($this->guzzleClient)) {
            $this->setGuzzleClient($this->createGuzzleClient());
        }
        return $this->guzzleClient;
    }

    /**
     * Creates a Guzzle client with local file caching middleware.
     *
     * @return \GuzzleHttp\Client
     *   The Guzzle client.
     */
    protected function createGuzzleClient(): Client {
        $stack = HandlerStack::create();
        $stack->push(
          new CacheMiddleware(new PrivateCacheStrategy(new DoctrineCacheStorage(new FilesystemCache(sys_get_temp_dir())))),
          'cache'
        );

        return new Client(['handler' => $stack]);
    }

    /**
     * Requests a node from the Drupal.org API.
     *
     * @param string $project
     *   The Drupal.org project to get the releases from.
     *
     * @return object
     *   The response object.
     *
     * @throws \GuzzleHttp\Exception\GuzzleException
     *   Thrown if request is unsuccessful.
     */
    protected function getProjectReleases($project) {
        if ($project === 'drupal/core') {
            $project = 'drupal';
        }
        else {
            $project = str_replace('drupal/', '', $project);
        }
        return $this->requestProjectReleases($project);
    }

    /**
     * Requests a node from the Drupal.org API.
     *
     * @param string $project
     *   The Drupal.org project name.
     *
     * @return object
     *   The response object.
     *
     * @throws \GuzzleHttp\Exception\GuzzleException
     *   Thrown if request is unsuccessful.
     *
     * @see https://www.drupal.org/drupalorg/docs/apis/rest-and-other-apis#s-releases
     * @see https://www.drupal.org/drupalorg/docs/apis/update-status-xml
     */
    protected function requestProjectReleases(string $project) {
        $client = $this->getGuzzleClient();
        $response = $client->request('GET', "https://updates.drupal.org/release-history/$project/current", [
          'on_stats' => static function (TransferStats $stats) use (&$url) {
              $url = $stats->getEffectiveUri();
          },
        ]);
        if ($response->getStatusCode() !== 200) {
            throw new \RuntimeException("Request to $url failed, returned {$response->getStatusCode()} with reason: {$response->getReasonPhrase()}");
        }
        $body = $response->getBody()->getContents();
        if (strpos($body, 'No release history was found for the requested project') !== FALSE) {
            $this->io->note('No release history was found for the requested project ' . $project);
        }

        $xml = simplexml_load_string($body);
        $json = json_decode(json_encode($xml), TRUE);

        return $json;
    }

    /**
     * Get's new release nodes for a given package from Drupal.org.
     *
     * @param string $package_name
     *   The name of the Drupal project.
     * @param string $current_version
     *   The version of the Drupal project currently in the codebase.
     * @param bool $security_only
     *   Whether or not to limit new releases to security releases.
     * @param string|null $exact_stability
     *   An exact stability flag if desired.
     *
     * @see isMinorUpdateAvailable
     *
     * @return array
     *   List of available releases.
     *
     * @throws \GuzzleHttp\Exception\GuzzleException
     */
    public function getNewReleases($package_name, $current_version, $security_only, $exact_stability = NULL): array {
        $releases_response = $this->getProjectReleases($package_name);
        $new_releases = [];
        if (!array_key_exists('releases', $releases_response)) {
            $this->io->warning("Could not find any Drupal.org releases for $package_name");
            return $new_releases;
        }
        $releases = $releases_response['releases']['release'];
        // Some projects only have a single release. E.g., head2head.
        if (array_key_exists('version', $releases)) {
            $releases = [$releases];
        }
        foreach ($releases as $release) {
            if (self::isMinorUpdateAvailable($package_name, $current_version, $release, $exact_stability)) {
                $new_releases[] = $release;
            }
        }
        if ($security_only) {
            $new_releases = array_filter(
              $new_releases,
              [self::class, 'releaseIsSecurityRelease']
            );
        }
        return $new_releases;
    }

    /**
     * Determines if a given release is a security release.
     *
     * @param array $release
     *   A Drupal.org project release.
     *
     * @return bool
     *   True if the release is marked as a security release.
     */
    public static function releaseIsSecurityRelease(array $release): bool {
        if (array_key_exists('terms', $release)) {
            $terms = $release['terms'];
            if (array_key_exists(0, $release['terms']['term'])) {
                $terms = $release['terms']['term'];
            }
            foreach ($terms as $term) {
                if ($term['value'] === 'Security update') {
                    return TRUE;
                }
            }
        }

        return FALSE;
    }

    /**
     * Normalizes a Drupal.ore release version number to a SemVer tag.
     *
     * @param string $project_name
     *   The name of the Drupal.org project.
     * @param string $version
     *   The version string.
     *
     * @return string
     *   SemVer normalized release number.
     */
    public static function normalizeDrupalProjectReleaseVersion(string $project_name, string $version): string {
        if (strpos($version, '8.x') !== FALSE) {
            return self::getSemanticVersion($version);
        }

        return $version;
    }

    /**
     * Generates a semantic version for a Drupal project.
     *
     * 3.0
     * 3.0-alpha1
     * 3.12-beta2
     * 4.0-rc12
     * 3.12
     * 1.0-unstable3
     * 0.1-rc2
     * 2.10-rc2
     *
     * {major}.{minor}.0-{stability}{#}
     *
     * @param string $drupal_version
     *   Legacy Drupal.org project release tag.
     *
     * @return string
     *   A semantic version string.
     */
    public static function getSemanticVersion(string $drupal_version): string {
        // Strip the 8.x prefix from the version.
        $version = preg_replace('/^8\.x-/', NULL, $drupal_version);

        if (preg_match('/-dev$/', $version)) {
            return preg_replace('/^(\d).+-dev$/', '$1.x-dev', $version);
        }

        $matches = [];
        preg_match('/^(\d{1,2})\.(\d{0,3})(\-(alpha|beta|rc|unstable)\d{1,2})?$/i', $version, $matches);
        $version = FALSE;
        if (!empty($matches)) {
            $version = "{$matches[1]}.{$matches[2]}.0";
            if (array_key_exists(3, $matches)) {
                $version .= $matches[3];
            }
        }

        return $version;
    }

    /**
     * Determines if a new minor release version is available.
     *
     * @param string $package_name
     *   The name of the Drupal.org project.
     * @param string $current_version
     *   The version currently in use by the application.
     * @param array $release
     *   The Drupal.org release.
     * @param string|null $exact_stability
     *   A specific stability (stable, beta, alpha, etc) to require.
     *
     * @return bool
     *   True if an update meeting the criteria is available.
     */
    public static function isMinorUpdateAvailable($package_name, $current_version, array $release, $exact_stability = NULL): bool {
        $current_version_parts = explode('.', $current_version);
        $release_version = self::normalizeDrupalProjectReleaseVersion($package_name, $release['version']);
        $release_version_parts = explode('.', $release_version);
        $minor_version_matches = $current_version_parts[0] === $release_version_parts[0];
        $release_is_new = Comparator::lessThan($current_version, $release_version);
        if ($exact_stability) {
            return $minor_version_matches && $release_is_new && $exact_stability === VersionParser::parseStability($release_version);
        }
        return $minor_version_matches && $release_is_new;
    }

    /**
     * Returns the type of update made by composer.
     *
     * @param string $package_name
     *   Name of the package.
     * @param string $current_version
     *   Current version of the package.
     * @param array $latest_release
     *   Contains release information for the latest update available.
     *
     * @return string
     *   Type of update detected
     */
    public static function getUpdateType(string $package_name, string $current_version, array $latest_release): string {
        $latest_release_version = DrupalOrgClient::normalizeDrupalProjectReleaseVersion($package_name, $latest_release['version']);
        $numbered_parts = explode('.', $current_version);
        $major_current_version = $numbered_parts[0];
        $minor_current_version = substr($numbered_parts[1], 0, 1);
        $numbered_parts = explode('.', $latest_release_version);
        $major_latest_release_version = $numbered_parts[0];
        $minor_latest_release_version = substr($numbered_parts[1], 0, 1);

        $major_version_matches = $major_current_version === $major_latest_release_version;
        $minor_version_matches = $minor_current_version === $minor_latest_release_version;

        if (DrupalOrgClient::releaseIsSecurityRelease($latest_release)) {
            return 'security';
        }
        if ($major_version_matches && $minor_version_matches) {
            return 'patch';
        }
        if ($major_version_matches) {
            return 'minor';
        }
        return 'major';

    }

}
