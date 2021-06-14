<?php

namespace Drupal\project_browser\DrupalOrg;

/**
 * Class DrupalOrgReleases
 *
 * This class accepts an array of releases. For each release,
 * it will create a DrupalOrgRelease object.
 *
 * @package Drupal\project_browser\DrupalOrg
 */
class DrupalOrgReleases extends \ArrayObject
{
    /**
     * @param array<object> $releases
     */
    public function __construct($releases)
    {
        parent::__construct(
          array_map(
            function ($release) {
                return new DrupalOrgRelease($release);
            },
            $releases
          ),
          self::ARRAY_AS_PROPS
        );
    }
}
