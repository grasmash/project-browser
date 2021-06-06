<?php

namespace Drupal\project_browser\Controller;

use Drupal\Core\Controller\ControllerBase;

class BrowserController extends ControllerBase {

    public function browse() {
        $module_service = \Drupal::service('extension.list.module')->getList();
        $modules_status = array_map(function($value) {
            return $value->status;
        }, $module_service);
        return [
            '#markup' => '<div id="project-browser"></div>',
            '#attached' => [
              'library' => [
                'project_browser/svelte',
              ],
              'drupalSettings' => [
                'project_browser' => [
                  'modules' => $modules_status,
                ],
              ],
            ],
        ];
    }

}
