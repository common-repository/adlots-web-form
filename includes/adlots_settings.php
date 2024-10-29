<?php
    if (!defined('ABSPATH')) exit;

    $message = '';
    $color = 'black';

    if (!empty($_POST)) {
        $retrieved_nonce = $_REQUEST['_wpnonce'];

        // check nonce
        if (!wp_verify_nonce($retrieved_nonce, 'set_adlots_settings'))
            die( 'Failed security check' );

        // check if user admin
        if (current_user_can('manage_options')) {
            if (!empty($_POST['adlots_url']) && !empty($_POST['use_garlic_js']) && !empty($_POST['use_phone_js']) && !empty($_POST['grecaptcha'])) {
                $adlots_url = esc_url( sanitize_text_field($_POST['adlots_url']) );
                if (filter_var($adlots_url, FILTER_VALIDATE_URL) === false) {
                    $message = __('URL is not valid', 'adlotswebform');
                    $color = 'indianred';
                } else {
                    $allowable_values = ["no", "yes"];

                    $use_garlic_js = sanitize_text_field($_POST['use_garlic_js']);
                    $use_phone_js = sanitize_text_field($_POST['use_phone_js']);
                    $grecaptcha = sanitize_text_field($_POST['grecaptcha']);

                    if (!in_array($use_garlic_js, $allowable_values) || !in_array($use_phone_js, $allowable_values) || !in_array($grecaptcha, $allowable_values)) {
                        $message = __('Data is not valid', 'adlotswebform');
                        $color = 'indianred';
                    } else {
                        // create the correct URL
                        $url_arr = parse_url($adlots_url);

                        if (count($url_arr) > 0) {
                            $correct_url = $url_arr['scheme'] . '://' . $url_arr['host'] . '/';

                            // update options
                            update_option('alwfp_site_url', $correct_url);
                            update_option('alwfp_use_garlic_js', $use_garlic_js);
                            update_option('alwfp_use_phone_js', $use_phone_js);
                            update_option('alwfp_grecaptcha', $grecaptcha);
                            update_option('alwfp_is_active', "yes");

                            $message = __('Settings were saved successfully');
                            $color = 'forestgreen';
                        } else {
                            $message = __('Data is not valid', 'adlotswebform');
                            $color = 'indianred';
                        }
                    }
                }
            }
        }
    }

    $adlots_url = get_option('alwfp_site_url');
    $use_garlic_js = get_option('alwfp_use_garlic_js');
    $use_phone_js = get_option('alwfp_use_phone_js');
    $grecaptcha = get_option('alwfp_grecaptcha');
?>

<h2><?php _e('AdLots Settings', 'adlotswebform')?></h2>
<?php if ($message != ''): ?>
    <p style="color: <?=$color?>">
        <?=$message?>
    </p>
<?php endif; ?>

<form action="" method="post">
    <?php wp_nonce_field('set_adlots_settings'); ?>
    <table class="form-table">
        <tbody>
        <tr>
            <th scope="row"><label for="adlots_url"><?=_e('AdLots Address (URL)', 'adlotswebform') ?></label></th>
            <td>
                <input type="url" name="adlots_url" value="<?=$adlots_url?>" class="code" size="60">
                <p class="description" id="tagline-description"><?=_e('Enter your AdLots URL', 'adlotswebform')?></p>
            </td>
        </tr>
        <tr>
            <th scope="row"><?=_e('Use Garlic.js library', 'adlotswebform')?></th>
            <td>
                <fieldset>
                    <label for="use_garlic_js">
                        <input type="radio" name="use_garlic_js" value="yes" <?php if (isset($use_garlic_js) && $use_garlic_js == "yes"): ?> checked="checked" <?php endif; ?>>
                        <span><?=_e('Yes', 'adlotswebform')?></span>
                    </label>
                    <br>
                    <label for="use_garlic_js">
                        <input type="radio" name="use_garlic_js" value="no" <?php if (isset($use_garlic_js) && $use_garlic_js == "no"): ?> checked="checked" <?php endif; ?>>
                        <span><?=_e('No', 'adlotswebform')?></span>
                    </label>
                </fieldset>
                <p class="description">
                    <?=_e('Garlic.js allows you to automatically persist your forms\' text field values locally, until the form is submitted. This way, your users don\'t lose any precious data if they accidentally close their tab or browser.', 'adlotswebform')?>
                </p>
                <p>
                    <a href="http://garlicjs.org/" target="_blank">http://garlicjs.org/</a>
                </p>
            </td>
        </tr>
        <tr>
            <th scope="row"><?=_e('Use international telephone input plugin', 'adlotswebform')?></th>
            <td>
                <fieldset>
                    <label for="use_phone_js">
                        <input type="radio" name="use_phone_js" value="yes" <?php if (isset($use_phone_js) && $use_phone_js == "yes"): ?> checked="checked" <?php endif; ?>>
                        <span><?=_e('Yes', 'adlotswebform')?></span>
                    </label>
                    <br>
                    <label for="use_phone_js">
                        <input type="radio" name="use_phone_js" value="no" <?php if (isset($use_phone_js) && $use_phone_js == "no"): ?> checked="checked" <?php endif; ?>>
                        <span><?=_e('No', 'adlotswebform')?></span>
                    </label>
                </fieldset>
                <p class="description">
                    <?=_e('A jQuery plugin for entering and validating international telephone numbers. It adds a flag dropdown to any input, detects the user\'s country, displays a relevant placeholder and provides formatting/validation methods.', 'adlotswebform')?>
                </p>
                <p>
                    <a href="https://github.com/jackocnr/intl-tel-input" target="_blank">https://github.com/jackocnr/intl-tel-input</a>
                </p>
            </td>
        </tr>
        <tr>
            <th scope="row">Google reCAPTCHA</th>
            <td>
                <fieldset>
                    <label for="grecaptcha">
                        <input type="radio" name="grecaptcha" value="yes" <?php if (isset($grecaptcha) && $grecaptcha == "yes"): ?> checked="checked" <?php endif; ?>>
                        <span><?=_e('Yes', 'adlotswebform')?></span>
                    </label>
                    <br>
                    <label for="grecaptcha">
                        <input type="radio" name="grecaptcha" value="no" <?php if (isset($grecaptcha) && $grecaptcha == "no"): ?> checked="checked" <?php endif; ?>>
                        <span><?=_e('No', 'adlotswebform')?></span>
                    </label>
                </fieldset>
                <p class="description">
                    <?=_e('Google reCAPTCHA is a free service that protects your website from spam and abuse')?>
                </p>
                <p>
                    <a href="https://www.google.com/recaptcha/intro/v3beta.html" target="_blank">https://www.google.com/recaptcha/intro/v3beta.html</a>
                </p>
            </td>
        </tr>
        </tbody>
    </table>
    <p class="submit">
        <input type="submit" name="submit" class="button button-primary" value="<?=_e('Save', 'adlotswebform')?>">
    </p>
</form>

