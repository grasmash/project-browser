<?php

namespace Drupal\project_browser\DrupalOrg;

use Composer\Semver\Semver;

class DrupalOrgRelease
{
    public $version;
    public $release_link;
    public $date;
    public $date_ago;
    public bool $is_compatible;

    protected $name = '';
    protected $tag = '';
    protected $download_link = '';
    protected $files = [];
    protected $terms = [];
    protected $security = '';
    protected $core_compatibility = '';

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
        /** @var \Drupal\Core\Datetime\DateFormatter $datedate_formatter */
        $date_formatter = \Drupal::service('date.formatter');
        $date_ago = $date_formatter->formatTimeDiffSince($this->date, [
          'granularity' => 2,
          'return_as_object' => TRUE,
        ])->toRenderable();
        $this->date_ago = $date_ago['#markup'] . t(' ago');

        $this->files = $release['files'];
        if (array_key_exists('terms', $release)) {
            $this->terms = $release['terms'];
        }
        $this->security = $release['security'];
        if (array_key_exists('core_compatibility', $release)) {
            $this->core_compatibility = $release['core_compatibility'];
            $this->is_compatible = Semver::satisfies(\Drupal::VERSION, $this->core_compatibility);
        }
    }
}
