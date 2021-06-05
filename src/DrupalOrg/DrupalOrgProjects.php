<?php

namespace Drupal\project_browser\DrupalOrg;

/**
 * Class DrupalOrgProjects
 *
 * This class accepts an array of projects. For each project,
 * it will create a DrupalOrgProject object.
 *
 * @package Drupal\project_browser\DrupalOrg
 */
class DrupalOrgProjects extends \ArrayObject
{
    /**
     * @param array<object> $projects
     */
    public function __construct($projects)
    {
        parent::__construct(
          array_map(
            function ($project) {
                return new DrupalOrgProject($project);
            },
            $projects
          ),
          self::ARRAY_AS_PROPS
        );
    }
}
