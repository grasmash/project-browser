<?php

namespace Drupal\project_browser\DrupalOrg;

use Composer\Semver\Comparator;
use Composer\Semver\VersionParser;
use Doctrine\Common\Cache\FilesystemCache;
use Drupal\project_browser\ProjectBrowserEndpointInterface;
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
    protected Client $guzzleClient;

  /**
   * Setter for the Guzzle client.
   *
   * @param \GuzzleHttp\Client $client
   *   The Guzzle client.
   */
    public function setGuzzleClient(Client $client): void
    {
        $this->guzzleClient = $client;
    }

  /**
   * Getter for the Guzzle client.
   *
   * @return \GuzzleHttp\Client
   *   The HTTP Client.
   */
    public function getGuzzleClient(): Client
    {
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
    protected function createGuzzleClient(): Client
    {
        $stack = HandlerStack::create();
        $stack->push(
            new CacheMiddleware(new PrivateCacheStrategy(new DoctrineCacheStorage(new FilesystemCache(sys_get_temp_dir())))),
            'cache'
        );

        return new Client(['handler' => $stack]);
    }

    /**
     * Get a list of all Drupal.org nodes of type 'project_module'.
     *
     * @see https://www.drupal.org/drupalorg/docs/apis/rest-and-other-apis
     *
     * @param array $query
     *
     * @return array
     * @throws \GuzzleHttp\Exception\GuzzleException
     * @throws \JsonException
     */
    public function getProjects($query = []): array
    {
        $client = $this->getGuzzleClient();
        $response = $client->request('GET', "https://www.drupal.org/api-d7/node.json", [
        'on_stats' => static function (TransferStats $stats) use (&$url) {
            $url = $stats->getEffectiveUri();
        },
        'query' => $query
        ]);
        if ($response->getStatusCode() !== 200) {
            throw new \RuntimeException("Request to $url failed, returned {$response->getStatusCode()} with reason: {$response->getReasonPhrase()}");
        }
        $body = json_decode($response->getBody()->getContents(), true, 512, JSON_THROW_ON_ERROR);

        return $body;
    }


    /**
     * Requests a node from the Drupal.org API.
     *
     * @param string $project
     *   The Drupal.org project to get the releases from.
     *
     * @return array
     *   An array releases.
     *
     * @throws \GuzzleHttp\Exception\GuzzleException Thrown if request is unsuccessful.
     */
    public function getProjectReleases(string $project) {
        if ($project === 'drupal/core') {
            $project = 'drupal';
        }
        else {
            $project = str_replace(['drupal/', 'acquia/'], '', $project);
        }
        $response = $this->requestProjectReleases($project);
        if (array_key_exists('releases', $response)) {
            // Only one release.
            if (array_key_exists('name', $response['releases']['release'])) {
                $response['releases'] = [$response['releases']['release']];
            }
            // Multiple releases.
            else {
                $response['releases'] = $response['releases']['release'];
            }
        }
        // No releases.
        else {
            $response['releases'] = [];
        }

        return $response;
    }

    /**
     * Requests a node from the Drupal.org API.
     *
     * @param string $project
     *   The Drupal.org project name.
     *
     * @return array The response object.
     *   The response object.
     *
     * @throws \GuzzleHttp\Exception\GuzzleException Thrown if request is unsuccessful.
     * @see https://www.drupal.org/drupalorg/docs/apis/rest-and-other-apis#s-releases
     * @see https://www.drupal.org/drupalorg/docs/apis/update-status-xml
     */
    protected function requestProjectReleases(string $project): array
    {
        $url = "https://updates.drupal.org/release-history/$project/current";
        $client = $this->getGuzzleClient();
        $response = $client->request('GET', $url);
        if ($response->getStatusCode() !== 200) {
            throw new \RuntimeException("Request to $url failed, returned {$response->getStatusCode()} with reason: {$response->getReasonPhrase()}");
        }
        $body = $response->getBody()->getContents();
        if (strpos($body, 'No release history was found for the requested project') !== FALSE) {
            return [];
        }

        $xml = simplexml_load_string($body);
        $json = json_decode(json_encode($xml), TRUE);

        return $json;
    }
}
