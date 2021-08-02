<?php
defined('ABSPATH') or die('No script kiddies please!');

/*
Plugin Name: WooCommerce Modamatch
*/

function fallback_notice()
{
  echo '<div class="error">';
  echo '<p>' . __('Modamatch: Needs the WooCommerce Plugin activated.', 'modamatch') . '</p>';
  echo '</div>';
}

if (!in_array('woocommerce/woocommerce.php', apply_filters('active_plugins', get_option('active_plugins')))) {
  add_action('admin_notices', 'fallback_notice');
} else {

  // **************************************************
  // Shared functions
  // **************************************************

  // get app url
  function app_host()
  {
    // replace this with application protocol and domain (ex: 'https://staging-modamatch.qmo.io')
    $app_host = 'http://localhost:3000';
    $trimmed_host = rtrim($app_host, '/');
    return $trimmed_host;
  }

  // get wordpress host
  function site_host()
  {
    $urlparts = parse_url(site_url());
    return $urlparts['host'] . ($urlparts['port'] ? ':' . $urlparts['port'] : '');
  }


  // **************************************************
  // Plugin setup
  // **************************************************

  // activation hook
  function pluginprefix_activate()
  {
    // Clear the permalinks
    flush_rewrite_rules();
  }

  // deactivation hook
  function pluginprefix_deactivate()
  {
    // Clear the permalinks
    flush_rewrite_rules();
  }

  // add scripts
  function modamatch_enqueue_iframe_resizer($hook)
  {
    if ('modamatch' != $hook) {
      return;
    }
    wp_enqueue_script('modamatch_iframe_resizer', "https://cdnjs.cloudflare.com/ajax/libs/iframe-resizer/4.3.1/iframeResizer.min.js", array(), '1.0');
  }

  // create admin page
  function modamatch_plugin_options()
  {
    if (!current_user_can("manage_options")) {
      wp_die(__("You do not have sufficient permissions to access this page."));
    }
    $modamatch_host = app_host();
    $format = '<script
      src="https://cdnjs.cloudflare.com/ajax/libs/iframe-resizer/4.3.1/iframeResizer.min.js"
      integrity="sha512-ngVIPTfUxNHrVs52hA0CaOVwC3/do2W4jUEJIufgZQicmY27iAJAind8BPtK2LoyIGiAFcOkjO18r5dTUNLFAw=="
      crossOrigin="anonymous"
    ></script>
    <div style="padding: 16px 0;">
      <iframe id="modamatch-instructions" src="%1$s/woocommerce-admin/install-instructions" title="Modamatch Admin Page" width="100%%" height="1080px"></iframe>
    </div>
    <script>
      document.addEventListener("DOMContentLoaded", function (event) {
        iFrameResize({ log: true }, "#modamatch-instructions")
      })
    </script>';
    echo sprintf(
      $format,
      $modamatch_host
    );
  }

  // create admin menu
  function modamatch_plugin_menu_func()
  {
    add_menu_page(
      "Modamatch",                // Page title
      "Modamatch",                // Menu title
      "manage_options",           // Minimum capability (manage_options is an easy way to target administrators)
      "modamatch",                // Menu slug
      "modamatch_plugin_options", // Callback that prints the markup
      "dashicons-admin-generic"   // Dashicons helper class
    );
  }

  // do actions
  register_activation_hook(__FILE__, 'pluginprefix_activate');
  register_deactivation_hook(__FILE__, 'pluginprefix_deactivate');
  add_action('admin_enqueue_scripts', 'modamatch_enqueue_iframe_resizer');
  add_action("admin_menu", "modamatch_plugin_menu_func");


  // **************************************************
  // Public facing setup
  // **************************************************

  // woocommerce-embed script injection
  function modamatch_script()
  {
    $modamatch_host = app_host();
    $instance_host = site_host();
    $format = '<script type="text/javascript" src="%1$s/api/woocommerce/%2$s/script"></script>';
    echo sprintf(
      $format,
      $modamatch_host,
      $instance_host
    );
  }

  // Get user and store data
  function modamatch_userdata()
  {
    // init woocommerce
    global $woocommerce;
    // https://developer.wordpress.org/reference/functions/wp_get_current_user/
    $current_user = wp_get_current_user();
    $user_id = esc_html($current_user->ID || '');
    $user_email = esc_html($current_user->user_email);
    $user_locale = esc_html(substr(get_user_locale(), 0, 2));
    // https://stackoverflow.com/questions/18365551/woocommerce-get-woocommerce-currency-symbol
    $currency_code = get_woocommerce_currency();
    // https://docs.woocommerce.com/document/shop-currency/ woocommerce doesn't support currency rates unless we add a possibly paid plugin. 
    // TODO: Find a way to set this to the appropriate rate. The rate is a multiplier of USD (so CAD would be 0.78 as of Feb 2021)
    $currency_rate = '1.0';
    // urls
    $instance_url = site_url();
    $instance_host = site_host();
    // create global object
    $format = '<script>
      var Woocommerce = {
        customerId: "%1$s",
        customerEmail: "%2$s",
        customerLocale: "%3$s",
        currencyCode: "%4$s",
        currencyRate: "%5$s",
        siteUrl: "%6$s",
        siteHost: "%7$s",
      }
    </script>';
    // print to page
    echo sprintf(
      $format,
      $user_id,
      $user_email,
      $user_locale,
      $currency_code,
      $currency_rate,
      $instance_url,
      $instance_host
    );
  }

  // create modamatch button shortcode
  function modamatch_shortcode($attributes, $content = null)
  {
    return "<button class='modamatch'>".$content."</button>";
  }

  // do actions
  add_action('wp_head', 'modamatch_script');
  add_action('wp_footer', 'modamatch_userdata');
  add_shortcode('modamatch', 'modamatch_shortcode');
}
