<?php

namespace Drupal\project_browser\Controller;

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
class DrupalOrgProxyController extends ControllerBase {

  /**
   * @var \Drupal\Core\Logger\LoggerChannelInterface
   */
  private $logger;

  /**
   * UserSubscriptionsController constructor.
   *
   * @param \Drupal\Core\Logger\LoggerChannelInterface $logger
   */
  public function __construct(LoggerChannelInterface $logger) {
    $this->logger = $logger;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container) {
    return new static(
      $container->get('logger.channel.project_browser'),
    );
  }

  /**
   * Responds to GET requests.
   *
   * Returns a list of bundles for specified entity.
   *
   * @throws \Symfony\Component\HttpKernel\Exception\HttpException
   *   Throws exception expected.
   */
  public function getAllProjects() {
    try {
      $drupal_org_client = new DrupalOrgClient();
      // @todo Pass through all query parameters from request.
      $projects = $drupal_org_client->getProjects();
      if ($projects) {
        // @todo Add 'enabled/uninstalled' status to each project.
        $response = new JsonResponse($projects, Response::HTTP_ACCEPTED);
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

  /**
   * @param string $name The machine name of the project.
   */
  public function getProject($name = NULL) {
    try {
      $drupal_org_client = new DrupalOrgClient();
      $project = $drupal_org_client->getProjects(['field_project_machine_name' => $name]);
      if ($project) {
        $response = new JsonResponse($project, Response::HTTP_ACCEPTED);
        // Configure caching for results.
        if ($response instanceof CacheableResponseInterface) {
          $response->addCacheableDependency($project);
        }
        return $response;
      }
      return new Response('Could not find any projects', Response::HTTP_BAD_REQUEST);
    }
    catch (\Exception $exception) {
        $this->logger->error($exception->getMessage());
        return new Response($exception->getMessage(), Response::HTTP_BAD_REQUEST);
    }
  }

}
