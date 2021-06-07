<?php

namespace Drupal\project_browser\Controller;

use Drupal\project_browser\DrupalOrg\DrupalOrgProjects;
use Drupal\project_browser\DrupalOrg\Taxonomy\MaintenanceStatus;
use Drupal\project_browser\DrupalOrg\Taxonomy\Vocabularies;
use Symfony\Component\HttpFoundation\Request;
use Drupal\Core\Cache\CacheableResponseInterface;
use Drupal\Core\Controller\ControllerBase;
use Drupal\Core\Logger\LoggerChannelInterface;
use Drupal\project_browser\DrupalOrg\DrupalOrgClient;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;

/**
 * Class UserSubscriptionsController.
 *
 * @package Drupal\chargebee_subscription\Controller
 */
class DrupalOrgProxyController extends ControllerBase
{

  /**
   * @var \Drupal\Core\Logger\LoggerChannelInterface
   */
    private $logger;

  /**
   * UserSubscriptionsController constructor.
   *
   * @param \Drupal\Core\Logger\LoggerChannelInterface $logger
   */
    public function __construct(LoggerChannelInterface $logger)
    {
        $this->logger = $logger;
    }

  /**
   * {@inheritdoc}
   */
    public static function create(ContainerInterface $container)
    {
        return new static(
            $container->get('logger.channel.project_browser'),
        );
    }

    /**
     * Responds to GET requests.
     *
     * Returns a list of bundles for specified entity.
     *
     * @param \Symfony\Component\HttpFoundation\Request $request
     *
     * @return \Drupal\Core\Cache\CacheableResponseInterface|mixed|\Symfony\Component\HttpFoundation\JsonResponse|\Symfony\Component\HttpFoundation\Response
     * @throws \GuzzleHttp\Exception\GuzzleException Throws exception expected.
     */
    public function getAllProjects(Request $request)
    {
        try {
            $drupal_org_client = new DrupalOrgClient();
          // Forward query parameters from request to Drupal.org Client.
            $query = $request->query->all();
            $query['type'] = 'project_module';
            $query['status'] = '1';
            $query['field_project_type'] = 'full';
          // @todo Show all but unsupported and obsolete.
            $query['taxonomy_vocabulary_' . Vocabularies::MAINTENANCE_STATUS] = MaintenanceStatus::ACTIVELY_MAINTAINED;
          // taxonomy_vocabulary_6 = Core compatibility
            $drupal_org_response = $drupal_org_client->getProjects($query);
            $projects = new DrupalOrgProjects($drupal_org_response['list']);
            if ($projects) {
                // @todo Remove Access-Control-Allow-Origin: * header when not in dev mode.
                // @todo Add 'count' property.
                $drupal_org_response['list'] = (array) $projects;
                $response = new JsonResponse($drupal_org_response, Response::HTTP_ACCEPTED, ['Access-Control-Allow-Origin' => '*']);
                if ($response instanceof CacheableResponseInterface) {
                    $response->addCacheableDependency($projects);
                }
                return $response;
            }
            return new Response('Could not find any projects', 400);
        } catch (\Exception $exception) {
            $this->logger->error($exception->getMessage());
            return new Response($exception->getMessage(), Response::HTTP_BAD_REQUEST);
        }
    }
}
