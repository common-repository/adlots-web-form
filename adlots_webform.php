<?php

/*
Plugin Name: AdLots Web Form Plugin
Plugin URI: 
Description: Simple non-bloated WordPress Contact Form
Version: 1.0
Author: AdLots
Author URI: https://adlots.io/
Text Domain: adlotswebform
Domain Path: /languages/
*/

    // prefix - alwfp

    if (!defined('ABSPATH')) exit;

    register_activation_hook(__FILE__, 'alwfp_activation');
    register_deactivation_hook(__FILE__, 'alwfp_deactivation');
    register_uninstall_hook(__FILE__, 'alwfp_uninstall');

    function alwfp_activation() {
        if (!empty(get_option('alwfp_site_url'))) {
            add_option('alwfp_is_active', 'yes');
        } else {
            add_option('alwfp_site_url', '');
            add_option('alwfp_use_garlic_js', 'no');
            add_option('alwfp_use_phone_js', 'no');
            add_option('alwfp_is_active', 'no');
            add_option('alwfp_grecaptcha', 'no');
        }
    }

    function alwfp_deactivation() {
        update_option('alwfp_is_active', 'no');
    }

    function alwfp_uninstall() {
        delete_option('alwfp_site_url');
        delete_option('alwfp_use_garlic_js');
        delete_option('alwfp_use_phone_js');
        delete_option('alwfp_is_active');
        delete_option('alwfp_grecaptcha');
    }

    add_shortcode('contact_form', 'alwfp_shortcode');

    function alwfp_shortcode($atts) {
        ob_start();

        $form_id = $atts['id'];
        if (empty($form_id)) {
            echo __('Form id is required', 'adlotswebform');
        }

        $integrity_hash = $atts['integrity_hash'];
        if (empty($integrity_hash)) {
            echo __('Integrity hash is required', 'adlotswebform');
        }

        $adlots_url = get_option('alwfp_site_url');

        if (!empty($adlots_url)) {
            $form = json_decode(file_get_contents($adlots_url . "/api/forms/get/" . $form_id), true);
            if ($form['status'] !== 'ok') {
                echo __('Form is unavailable', 'adlotswebform');
            }

            echo str_replace('|$hash|', $integrity_hash, $form['html']);
        }

        return ob_get_clean();
    }

    add_action('admin_menu', 'alwfp_admin_menu');

    function alwfp_admin_menu() {
        add_options_page('AdLots', 'AdLots', 8, 'adlots', 'alwfp_settings');
    }

    function alwfp_settings() {
        include_once("includes/adlots_settings.php");
    }

    add_action('plugins_loaded', 'alwfp_load_plugin_textdomain');

    function alwfp_load_plugin_textdomain() {
        load_plugin_textdomain('adlotswebform', false, dirname(plugin_basename(__FILE__)) . '/languages/');
    }

    add_action( 'wp_enqueue_scripts', 'alwfp_load_plugin_scripts' );


    function alwfp_load_plugin_scripts() {
        $alwfp_is_active = get_option('alwfp_is_active');

        if ($alwfp_is_active == "yes") {
            // load visitor script
            wp_enqueue_script('alwfp_visitor', plugins_url('assets/js/visitor.js', __FILE__), array(), '1.0.0', true);
            $adlots_obj = [
                'adlots_url' => get_option('alwfp_site_url'),
            ];
            wp_localize_script('alwfp_visitor', 'adlots_obj', $adlots_obj);

            // load Google reCAPTCHA script
            $alwfp_grecaptcha = get_option('alwfp_grecaptcha');
            if ($alwfp_grecaptcha == 'yes') {
                wp_enqueue_script('alwfp_grecaptcha', "https://www.google.com/recaptcha/api.js", array(), false, false);
            }

            wp_enqueue_script('alwfp_form_validator', plugins_url('assets/js/FGFormValidator.js', __FILE__), array('jquery'), '1.0.0', true);
            wp_enqueue_script('alwfp_form_validator_init', plugins_url('assets/js/FGFormValidatorInit.js', __FILE__), array('alwfp_form_validator'), '1.0.0', true);
            // сюда можно будет подключить скрипты форм и не париться

            $alwfp_garlic_js = get_option('alwfp_use_garlic_js');
            $alwfp_phone_js = get_option('alwfp_use_phone_js');

            if ($alwfp_garlic_js == 'yes') {
                wp_enqueue_script('alwfp_garlic', plugins_url('assets/js/garlic.min.js', __FILE__), array('jquery'), '1.2.3', true);
                wp_enqueue_script('alwfp_garlic_init', plugins_url('assets/js/garlicInit.js', __FILE__), array('jquery', 'alwfp_garlic'), '1.0.0', true);
            }

            if ($alwfp_phone_js == 'yes') {
                wp_enqueue_style('fg_intl_tel_input', plugins_url('assets/css/intlTelInput.css', __FILE__), array(), '1.0.0', false);

                $utils = plugins_url('assets/js/utils.js', __FILE__);
                wp_enqueue_script('fg_utils', $utils, array('jquery'), '2.0', true);

                wp_enqueue_script('fg_intl_tel_input', plugins_url('assets/js/intlTelInput.min.js', __FILE__), array('jquery'), '1.0.0', true);
                wp_enqueue_script('fg_intl_tel_input_init', plugins_url('assets/js/intlTelInputInit.js', __FILE__), array('fg_intl_tel_input'), '1.0.0', true);

                $adlots_obj = [
                    'adlots_url' => get_option('adlots_url'),
                    'utils' => $utils
                ];

                wp_localize_script('fg_intl_tel_input_init', 'adlots_obj', $adlots_obj);
            }
        }

        add_filter('script_loader_tag', 'alwfp_add_attr_to_script_tag', 10, 2);

        function alwfp_add_attr_to_script_tag($tag, $handle) {
            if ($handle === 'alwfp_visitor') {
                return str_replace( ' src=', ' id="tvl" src=', $tag );
            }

            return $tag;
        }

        add_filter('script_loader_src', 'alwfp_add_parameter_to_src_attribute', 10, 2);

        function alwfp_add_parameter_to_src_attribute($src, $handle) {
            if ($handle === 'alwfp_grecaptcha') {
                $string_array = explode("?", $src);
                return $string_array[0].'?render=explicit';
            }

            return $src;
        }
    }
