<?php

namespace Drupal\project_browser\DrupalOrg;

use Drupal\Component\Utility\Unicode;
use Drupal\KernelTests\Core\Theme\SafeMarkupTestMarkup;
use Drupal\project_browser\DrupalOrg\Taxonomy\DevelopmentStatus;
use Drupal\project_browser\DrupalOrg\Taxonomy\MaintenanceStatus;

class DrupalOrgProject
{
    // Public properties. These are the properties that are exposed to JS.
    public $author;
    public $body;
    public $created;
    public $changed;
    public $field_project_images = [];
    public $nid;
    public $status;
    public $type;
    public $title;
    public $url;
    public $project_usage;
    public $field_security_advisory_coverage;
    public $field_project_machine_name;
    public $field_supporting_organizations = [];

    // Module categories.
    public $taxonomy_vocabulary_3;

    // Maintenance status.
    public $taxonomy_vocabulary_44;
    public ?string $maintenance_status;

    // Development status.
    public $taxonomy_vocabulary_46;
    public ?string $development_status;

    // Non-public properties.
    protected $sticky;
    protected $promote;
    protected $edit_url;
    protected $language;
    protected $is_new;
    protected $vid;
    protected $flag_project_star_user;
    protected $field_issue_summary_template;
    protected $field_replaced_by;
    protected $field_next_major_version_info;
    protected $field_project_ecosystem;
    protected $field_project_issue_version_opts;
    protected $field_project_components = [];
    protected $field_project_docs;
    protected $field_project_license;
    protected $field_project_screenshots = [];
    protected $field_project_documentation;
    protected $field_project_demo;
    protected $upload = [];
    protected $field_project_changelog;
    protected $field_project_homepage;
    protected $field_release_version_format;
    protected $field_project_has_releases;
    protected $field_project_issue_guidelines;
    protected $field_project_default_component;
    protected $field_project_has_issue_queue;
    protected $field_project_type;
    protected $last_comment_timestamp;
    protected $has_new_content;
    protected $flag_tracker_follower_count;
    protected $feed_nid;
    protected $feeds_item_url;
    protected $feeds_item_guid;
    protected $comment_count_new;
    protected $comment_count;
    protected $comments;
    protected $comment;
    protected $book_ancestors;

    /**
     * @param array $project
     */
    public function __construct(array $project)
    {
        $this->created = $project['created'];
        $this->changed = $project['changed'];
        $this->sticky = $project['sticky'];
        $this->promote = $project['promote'];
        $this->status = $project['status'];
        $this->edit_url = $project['edit_url'];
        $this->language = $project['language'];
        $this->type = $project['type'];
        $this->is_new = $project['is_new'];
        $this->vid = $project['vid'];
        $this->nid = $project['nid'];
        $this->flag_project_star_user = $project['flag_project_star_user'];
        $this->field_issue_summary_template = $project['field_issue_summary_template'];
        $this->field_replaced_by = $project['field_replaced_by'];
        $this->field_next_major_version_info = $project['field_next_major_version_info'];
        $this->field_project_ecosystem = $project['field_project_ecosystem'];
        $this->field_security_advisory_coverage = $project['field_security_advisory_coverage'];
        $this->field_project_issue_version_opts = $project['field_project_issue_version_opts'];
        $this->field_project_docs = $project['field_project_docs'];
        $this->field_supporting_organizations = $project['field_supporting_organizations'];
        $this->field_project_images = $project['field_project_images'];
        $this->field_project_license = $project['field_project_license'];
        $this->field_project_screenshots = $project['field_project_screenshots'];
        $this->field_project_documentation = $project['field_project_documentation'];
        $this->field_project_demo = $project['field_project_demo'];
        $this->upload = $project['upload'];
        $this->title = $project['title'];
        $this->url = $project['url'];
        $this->setBody($project['body']);
        $this->field_project_components = $project['field_project_components'];
        $this->field_project_changelog = $project['field_project_changelog'];
        $this->field_project_homepage = $project['field_project_homepage'];
        $this->field_release_version_format = $project['field_release_version_format'];
        $this->field_project_has_releases = $project['field_project_has_releases'];
        $this->field_project_issue_guidelines = $project['field_project_issue_guidelines'];
        $this->field_project_default_component = $project['field_project_default_component'];
        $this->field_project_has_issue_queue = $project['field_project_has_issue_queue'];
        $this->field_project_machine_name = $project['field_project_machine_name'];
        $this->field_project_type = $project['field_project_type'];
        $this->last_comment_timestamp = $project['last_comment_timestamp'];
        $this->has_new_content = $project['has_new_content'];
        $this->flag_tracker_follower_count = $project['flag_tracker_follower_count'];
        $this->feed_nid = $project['feed_nid'];
        $this->feeds_item_url = $project['feeds_item_url'];
        $this->feeds_item_guid = $project['feeds_item_guid'];
        $this->comment_count_new = $project['comment_count_new'];
        $this->comment_count = $project['comment_count'];
        $this->comments = $project['comments'];
        $this->comment = $project['comment'];
        $this->book_ancestors = $project['book_ancestors'];
        $this->author = $project['author'];

        if (array_key_exists('project_usage', $project)) {
            $this->project_usage = $project['project_usage'];
        }

        // Module categories
        $this->taxonomy_vocabulary_3 = $project['taxonomy_vocabulary_3'];

        // Maintenance status
        if (array_key_exists('taxonomy_vocabulary_44', $project) && $project['taxonomy_vocabulary_44']) {
            $this->taxonomy_vocabulary_44 = $project['taxonomy_vocabulary_44'];
            $this->maintenance_status = MaintenanceStatus::getStatusString($this->taxonomy_vocabulary_44['id']);
        }

        // Development status
        if (array_key_exists('taxonomy_vocabulary_46', $project) && $project['taxonomy_vocabulary_46']) {
            $this->taxonomy_vocabulary_46 = $project['taxonomy_vocabulary_46'];
            $this->development_status = DevelopmentStatus::getStatusString($this->taxonomy_vocabulary_46['id']);
        }
    }

    /**
     * @param $body
     */
    protected function setBody($body): void
    {
        $this->body = $body;
        if (!array_key_exists('value', $this->body)) {
            $this->body['value'] = '';
        }
        if (!array_key_exists('summary', $this->body)) {
            $this->body['summary'] = '';
        }

        if (!$this->body['summary']) {
            $this->body['summary'] = $this->body['value'];
        }
        $this->body['summary'] = strip_tags($this->body['summary'], ['p', 'a', 'b', 'i', 'u', 'em', 'strong']);
        $this->body['summary'] = Unicode::truncate($this->body['summary'], 200, true, true);
    }
}
