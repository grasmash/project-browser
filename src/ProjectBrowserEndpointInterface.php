<?php

namespace Drupal\project_browser;

use Drupal\project_browser\DrupalOrg\DrupalOrgProjects;
use Drupal\project_browser\DrupalOrg\DrupalOrgReleases;

interface ProjectBrowserEndpointInterface {
    public function getProjects(array $query = []): DrupalOrgProjects;
    public function getProjectReleases(string $project): DrupalOrgReleases;
}

