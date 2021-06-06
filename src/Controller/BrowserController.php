<?php

namespace Drupal\project_browser\Controller;

use Drupal\Core\Controller\ControllerBase;
use Drupal\Core\Extension\InfoParserException;
use Drupal\Core\Extension\ModuleExtensionList;

class BrowserController extends ControllerBase {

    public function browse() {

        /** @var ModuleExtensionList $module_service */
        $module_service = \Drupal::service('extension.list.module');
        // Sort all modules by their names.
        try {
            // The module list needs to be reset so that it can re-scan and include
            // any new modules that may have been added directly into the filesystem.
            $modules = $module_service->reset()->getList();
            uasort($modules, 'system_sort_modules_by_info_name');
        }
        catch (InfoParserException $e) {
            $this->messenger()->addError($this->t('Modules could not be listed due to an error: %error',
              ['%error' => $e->getMessage()]));
            $modules = [];
        }

        $modules_status = array_map(function($value) {
            return $value->status;
        }, $modules);
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
