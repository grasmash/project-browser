<?php
namespace Drupal\custom_rest\Plugin\rest\resource;
use Drupal\node\Entity\Node;
use Drupal\rest\Plugin\ResourceBase;
use Drupal\rest\ResourceResponse;
use Drupal\Core\Session\AccountProxyInterface;
use Psr\Log\LoggerInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Drupal\Core\Cache\CacheableResponseInterface;
/**
 * Annotation for get method
 *
 * @RestResource(
 *   id = "drupal_org_project",
 *   label = @Translation("Drupal.org Project GET"),
 *   uri_paths = {
 *     "canonical" = "/drupalorgproxy/v1/project/{id}"
 *   }
 * )
 */
class DrupalOrgProjectResource extends ResourceBase
{
    /**
     * A current user instance.
     *
     * @var \Drupal\Core\Session\AccountProxyInterface
     */
    protected $currentUser;
    /**
     * Constructs a Drupal\rest\Plugin\ResourceBase object.
     *
     * @param array $configuration
     *   A configuration array containing information about the plugin instance.
     * @param string $plugin_id
     *   The plugin_id for the plugin instance.
     * @param mixed $plugin_definition
     *   The plugin implementation definition.
     * @param array $serializer_formats
     *   The available serialization formats.
     * @param \Psr\Log\LoggerInterface $logger
     *   A logger instance.
     * @param \Drupal\Core\Session\AccountProxyInterface $current_user
     *   A current user instance.
     */
    public function __construct(
      array $configuration,
      $plugin_id,
      $plugin_definition,
      array $serializer_formats,
      LoggerInterface $logger,
      AccountProxyInterface $current_user)
    {
        parent::__construct($configuration, $plugin_id, $plugin_definition, $serializer_formats, $logger);
        $this->currentUser = $current_user;
    }
    /**
     * {@inheritdoc}
     */
    public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition)
    {
        return new static(
          $configuration,
          $plugin_id,
          $plugin_definition,
          $container->getParameter('serializer.formats'),
          $container->get('logger.factory')->get('custom_rest'),
          $container->get('current_user')
        );
    }
    /**
     * Responds to GET requests.
     *
     * Returns a list of bundles for specified entity.
     *
     * @throws \Symfony\Component\HttpKernel\Exception\HttpException
     *   Throws exception expected.
     */
    public function get($node_id)
    {

        if($node_id){
            // Load node
            $node = Node::load($node_id);
            if(is_object($node)){
                $response_result[$node->id()] = $node->getTitle();
                $response = new ResourceResponse($response_result);
                // Configure caching for results
                if ($response instanceof CacheableResponseInterface) {
                    $response->addCacheableDependency($response_result);
                }
                return $response;
            }
            return new ResourceResponse('Article doesn\'t exist',400);
        }
        return new ResourceResponse('Article Id is required',400);
    }
}
