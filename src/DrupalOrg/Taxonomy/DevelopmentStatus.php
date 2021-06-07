<?php

namespace Drupal\project_browser\DrupalOrg\Taxonomy;

/**
 * Class DevelopmentStatus
 * @package Drupal\project_browser\DrupalOrg\Taxonomy
 * @see https://www.drupal.org/drupalorg/docs/apis/rest-and-other-apis#s-filtering-on-issue-data
 */
abstract class DevelopmentStatus
{

    public const UNDER_ACTIVE_DEVELOPMENT = 9988;
    public const MAINTENANCE_FIXES_ONLY = 13030;
    public const NO_FURTHER_DEVELOPMENT = 16538;
    public const OBSOLETE = 9994;

    /**
     * @param $number
     *
     * @return string|null
     */
    public static function getStatusString($number): ?string
    {
        $string_map = [
          self::UNDER_ACTIVE_DEVELOPMENT => 'Under active development',
          self::MAINTENANCE_FIXES_ONLY => 'Maintenance fixes only',
          self::NO_FURTHER_DEVELOPMENT => 'No further development',
          self::OBSOLETE => 'Obsolete',
        ];
        return $string_map[$number] ?? null;
    }
}
