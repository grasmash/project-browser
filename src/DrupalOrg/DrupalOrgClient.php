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
class DrupalOrgClient
{

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
}
