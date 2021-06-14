<?php

namespace Drupal\project_browser\DrupalOrg;

use Composer\Semver\Semver;

class DrupalOrgRelease
{

    public $name;
    public $version;
    public $tag;
    public $release_link;
    public $download_link;
    public $date;
    public $files = [];
    public $terms = [];
    public $security;
    public $core_compatibility;
    public bool $is_compatible;

    /**
     * @param array $release
     */
    public function __construct(array $release)
    {
        $this->name = $release['name'];
        $this->version = $release['version'];
        $this->tag = $release['tag'];
        $this->release_link = $release['release_link'];
        $this->download_link = $release['download_link'];
        $this->date = $release['date'];
        $this->files = $release['files'];
        if (array_key_exists('terms', $release)) {
            $this->terms = $release['terms'];
        }
        $this->security = $release['security'];
        $this->core_compatibility = $release['core_compatibility'];
        $this->is_compatible = Semver::satisfies(\Drupal::VERSION, $this->core_compatibility);
    }
}
