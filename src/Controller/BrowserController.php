<?php

namespace Drupal\project_browser\Controller;

use Drupal\Core\Cache\CacheableResponseInterface;
use Drupal\Core\Controller\ControllerBase;
use Drupal\Core\Logger\LoggerChannelInterface;
use Drupal\project_browser\DrupalOrg\DrupalOrgClient;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;

class BrowserController extends ControllerBase {
    public function browse() {
        // todo Add JS that queries /drupal-org-proxy/project.
        return [];
    }
}
