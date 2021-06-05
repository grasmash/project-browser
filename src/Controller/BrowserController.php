<?php

namespace Drupal\project_browser\Controller;

use Drupal\Core\Controller\ControllerBase;

class BrowserController extends ControllerBase {

    public function browse() {
        // @todo Add HTML, CSS, JS from sveltejs/public.
        return [
            '#markup' => '<div id="project-browser"></div>',
            '#attached' => [
              'library' => [
                'project_browser/svelte',
              ]
            ],
        ];
    }

}
