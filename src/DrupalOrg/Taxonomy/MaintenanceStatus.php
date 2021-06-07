<?php

namespace Drupal\project_browser\DrupalOrg\Taxonomy;

/**
 * Class MaintenanceStatus
 * @package Drupal\project_browser\DrupalOrg\Taxonomy
 * @see https://www.drupal.org/drupalorg/docs/apis/rest-and-other-apis#s-filtering-on-issue-data
 */
abstract class MaintenanceStatus
{

    public const ACTIVELY_MAINTAINED = 13028;
    public const MINIMALLY_MAINTAINED = 19370;
    public const SEEKING_COMAINTAINERS = 9990;
    public const SEEKING_NEW_MAINTAINER = 9992;
    public const UNSUPPORTED = 13032;

    /**
     * @param $number
     *
     * @return string|null
     */
    public static function getStatusString($number): ?string
    {
        $string_map = [
          self::ACTIVELY_MAINTAINED => 'Actively maintained',
          self::MINIMALLY_MAINTAINED => 'Minimally maintained',
          self::SEEKING_COMAINTAINERS => 'Seeking co-maintainers',
          self::SEEKING_NEW_MAINTAINER => 'Seeking new maintainer',
          self::UNSUPPORTED => 'Unsupported',
        ];
        return $string_map[$number] ?? null;
    }
}
