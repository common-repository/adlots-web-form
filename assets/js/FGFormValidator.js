/**
 * plugin for forms validation
 */

/**
 * 
 * @param {string} selector
 * @returns {FGFormValidator}
 */
function FGFormValidator(selector) 
{
    this.selector = selector;
    this.form = jQuery(this.selector);
    
    this.init();
    
    return this;
}

FGFormValidator.prototype = {
    
    /**
     * Initialization
     */
    init: function ()
    {
        this.form.attr('novalidate', 'novalidate');
        this.form.find('.form-submit').prop('disabled', false);
    },
    
    /**
     * Makes validation
     */
    validate: function () 
    {
        var prototype_object = this;
        
        this.form.on('submit', function (event)
        {
//  Init
            var errors = [];
            var processed_fields = [];
            var lang_default = 'en';
            
            event.preventDefault();
            
//  Disable submit button
            var form = jQuery(this);
            form.find('.form-submit').prop('disabled', true);
            current_form_id = form.attr('id');
            
//  Get lang
            var lang = window.navigator.userLanguage || window.navigator.language;
            if (lang !== undefined)
            {
                lang = lang.split('-');
                lang = lang[0];
                if (fg_form_local[lang] === undefined)
                {
                    lang = lang_default;
                }
            }
            else 
            {
                lang = lang_default;
            }
            
//  Get required fields
            var required_elements = form.find('.required');
            required_elements.each(function ()
            {
//  Init
                var error = '';
                var element = jQuery(this);
                
//  Provent revalidation for groups
                if (processed_fields[element.attr('name')] !== undefined)
                {
                    return;
                }
                
                if (element.prop('tagName') === 'INPUT')
                {
                    switch (element.prop('type'))
                    {
//  Text
                        case 'text':
                            var value = element.val();
                            value = value.trim();
                            if (value.length < 1)
                            {
                                error = fg_form_local[lang]['empty'];
                                errors[element.prop('id')] = 1;
                            }
                            else if (value.length > 100)
                            {
                                error = fg_form_local[lang]['long'];
                                errors[element.prop('id')] = 1;
                            }
                            break;
//  Password
                        case 'password':
                            var value = element.val();
                            value = value.trim();
                            if (value.length < 1)
                            {
                                error = fg_form_local[lang]['empty'];
                                errors[element.prop('id')] = 1;
                            }
                            else if (value.length > 20)
                            {
                                error = fg_form_local[lang]['format'];
                                errors[element.prop('id')] = 1;
                            }
                            break;
//  E-mail
                        case 'email':
                            var value = element.val();
                            value = value.trim();
                            if (value.length < 1)
                            {
                                error = fg_form_local[lang]['empty'];
                                errors[element.prop('id')] = 1;
                            }
                            else 
                            {
                                if (prototype_object.checkFormatEmail(value) === false)
                                {
                                    error = fg_form_local[lang]['format'];
                                    errors[element.prop('id')] = 1;
                                }
                            }
                            break;
//  Phone
                        case 'tel':
                            var value = element.val();
                            value = value.trim();
                            if (value.length < 1)
                            {
                                error = fg_form_local[lang]['empty'];
                                errors[element.prop('id')] = 1;
                            }
                            else if (value.length > 100)
                            {
                                error = fg_form_local[lang]['format'];
                                errors[element.prop('id')] = 1;
                            }
                            else 
                            {
                                if (prototype_object.checkFormatPhone(value) === false)
                                {
                                    error = fg_form_local[lang]['format'];
                                    errors[element.prop('id')] = 1;
                                }
                            }
                            break;
//  URL
                        case 'url':
                            var value = element.val();
                            value = value.trim();
                            if (value.length < 1)
                            {
                                error = fg_form_local[lang]['empty'];
                                errors[element.prop('id')] = 1;
                            }
                            else 
                            {
                                if (prototype_object.checkFormatUrl(value) === false)
                                {
                                    error = fg_form_local[lang]['format'];
                                    errors[element.prop('id')] = 1;
                                }
                            }
                            break;
//  Number
                        case 'number':
                            var value = element.val();
                            value = value.trim();
                            if (value.length < 1)
                            {
                                error = fg_form_local[lang]['format'];
                                errors[element.prop('id')] = 1;
                            }
                            else if (value.length > 100)
                            {
                                error = fg_form_local[lang]['format'];
                                errors[element.prop('id')] = 1;
                            }
                            else 
                            {
                                if (prototype_object.checkFormatNumber(value) === false)
                                {
                                    error = fg_form_local[lang]['format'];
                                    errors[element.prop('id')] = 1;
                                }
                            }
                            break;
//  File
                        case 'file':
                            var value = element.val();
                            if (value.length < 1)
                            {
                                error = fg_form_local[lang]['empty'];
                                errors[element.prop('id')] = 1;
                            }
                            else 
                            {
//  File >> extension
                                if (element.attr('accept') != undefined)
                                {
                                    var extension = value.split('.');
                                    if (extension.length == 2)
                                    {
                                        extension = extension[1].toLowerCase();
                                        var allowed_extensions = element.attr('accept').split(',');
                                        var extension_found = false;
                                        for (var i in allowed_extensions)
                                        {
                                            if ('.'+extension == allowed_extensions[i])
                                            {
                                                extension_found = true;
                                            }
                                        }
                                        if (extension_found == false)
                                        {
                                            error = fg_form_local[lang]['format'];
                                            errors[element.prop('id')] = 1;
                                        }
                                    }
                                }
//  File >> size                
                                if (element.attr('size') != undefined && element.attr('size') != 0)
                                {
                                    if (element[0].files !== undefined)
                                    {
                                        if (element.attr('size') * 1000 < element[0].files[0].size)
                                        {
                                            error = fg_form_local[lang]['big_file'];
                                            errors[element.prop('id')] = 1;
                                        }
                                    }
                                }
                            }
                            break;
//  Groups
                        case 'radio':
                        case 'checkbox':
                            var checked = false;
                            var group = element.parent().parent().parent().find('.required');
                            group.each(function(){
                                if (jQuery(this).prop('checked') == true)
                                {
                                    checked = true;
                                }
                            });
                            if (checked === false)
                            {
                                error = fg_form_local[lang]['chose'];
                                errors[element.prop('id')] = 1;
                            }
                            break;
                    }
                }
//  Select
                else if (element.prop('tagName') === 'SELECT')
                {
                    var value = element.val();
                    value = value.trim();
                    if (value.length < 1)
                    {
                        error = fg_form_local[lang]['chose'];
                        errors[element.prop('id')] = 1;
                    }
                }
//  Textarea
                else if (element.prop('tagName') === 'TEXTAREA')
                {
                    var value = element.val();
                    value = value.trim();
                    if (value.length < 1)
                    {
                        error = fg_form_local[lang]['empty'];
                        errors[element.prop('id')] = 1;
                    }
                    else if (value.length > 1000)
                    {
                        error = fg_form_local[lang]['format'];
                        errors[element.prop('id')] = 1;
                    }
                }
//  Ignore
                else 
                {
                    return;
                }
                
//  Display/hide errors
                prototype_object.displayErrors(element, error, errors);
                processed_fields[element.attr('name')] = true;
            });
            
//  Elements with special format ================================
            var elements = form.find('input').not('.required');
            elements.each(function ()
            {
                var error = '';
                var element = jQuery(this);
                
//  Ignore hidden fields
                if (element.attr('type') == 'hidden')
                {
                    return;
                }
                
//  Provent revalidation for groups
                if (processed_fields[element.attr('name')] !== undefined)
                {
                    return;
                }
                
                var value = element.val();
                value = value.trim();
                
                switch (element.prop('type'))
                {
//  E-mail
                    case 'email':
                        if (value.length > 1)
                        {
                            if (prototype_object.checkFormatEmail(value) === false)
                            {
                                error = fg_form_local[lang]['format'];
                                errors[element.prop('id')] = 1;
                            }
                        }
                        break;
                        
//  Phone
                    case 'tel':
                        if (value.length > 1)
                        {
                            if (prototype_object.checkFormatPhone(value) === false)
                            {
                                error = fg_form_local[lang]['format'];
                                errors[element.prop('id')] = 1;
                            }
                        }
                        break;

//  URL
                     case 'url':
                        if (value.length > 1)
                        {
                            if (prototype_object.checkFormatUrl(value) === false)
                            {
                                error = fg_form_local[lang]['format'];
                                errors[element.prop('id')] = 1;
                            }
                        }
                        break;
                    
//  Number
                    case 'number':
                        if (value.length > 1)
                        {
                            if (prototype_object.checkFormatNumber(value) === false)
                            {
                                error = fg_form_local[lang]['format'];
                                errors[element.prop('id')] = 1;
                            }
                        }
                        break;
                    
//  File
                    case 'file':
                        if (value.length > 1)
                        {
//  File >> extension
                            if (element.attr('accept') != undefined)
                            {
                                var extension = value.split('.');
                                if (extension.length == 2)
                                {
                                    extension = extension[1].toLowerCase();
                                    var allowed_extensions = element.attr('accept').split(',');
                                    var extension_found = false;
                                    for (var i in allowed_extensions)
                                    {
                                        if ('.'+extension == allowed_extensions[i])
                                        {
                                            extension_found = true;
                                        }
                                    }
                                    if (extension_found == false)
                                    {
                                        error = fg_form_local[lang]['format'];
                                        errors[element.prop('id')] = 1;
                                    }
                                }
                            }
//  File >> size                
                            if (element.attr('size') != undefined && element.attr('size') != 0)
                            {
                                if (element[0].files !== undefined)
                                {
                                    if (element.attr('size') * 1000 < element[0].files[0].size)
                                    {
                                        error = fg_form_local[lang]['big_file'];
                                        errors[element.prop('id')] = 1;
                                    }
                                }
                            }
                        }
                        break;
                }
                
                prototype_object.displayErrors(element, error, errors);
                processed_fields[element.attr('name')] = true;
            });
            
//  Set cursor position
            if (Object.keys(errors).length > 0)
            {
                var error_index = 0;
                for (var i in errors)
                {
                    if (errors[i] === null)
                    {
                        continue;
                    }

                    if (error_index > 0)
                    {
                        break;
                    }
                    jQuery('#'+i).focus();

                    error_index++;
                }
                
//  Enable submit button
                form.find('.form-submit').prop('disabled', false);
            }
            else 
            {
//  reCAPTCHA
                var recaptcha_id = form.find('.g-recaptcha').attr('id');
                var recaptcha_site_key = form.find('.g-recaptcha').attr('data-sitekey');
                if (recaptcha_id != undefined && recaptcha_id != null && grecaptcha != undefined)
                {
                    if (recaptcha_widgets[recaptcha_id] === undefined)
                    {
                        recaptcha_widgets[recaptcha_id] = grecaptcha.render(
                            recaptcha_id, 
                            {
                                'sitekey' : recaptcha_site_key,
                                'size' : 'invisible',
                                'callback' : 'recaptchaCallback'
                            }
                        );
                    }
                    
//  To prevent submit when reCAPTCHA closed or during sending request
                    form.find('.form-submit').bind(
                        "click", 
                        function(e) 
                        {
                            e.preventDefault();
                            grecaptcha.execute(recaptcha_widgets[recaptcha_id]);
                        } 
                    );
                    
                    grecaptcha.execute(recaptcha_widgets[recaptcha_id]);
                    
                    setTimeout(
                        function()
                        {
                            form.find('.form-submit').prop('disabled', false);
                        },
                        2000
                    );
                }
//  Submit form
                else 
                {
                    form.unbind('submit');
                    current_form_id = null;
                    form.submit();
                }
            }
            
            return false;
        });
    },
    
    /**
     * Validates e-mail format
     * @param {string} string
     * @returns {boolean}
     */
    checkFormatEmail: function(string)
    {
        var regexp = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
        return regexp.test(string);
    },
    
    /**
     * Validates phone format
     * @param {string} string
     * @returns {boolean}
     */
    checkFormatPhone: function(string)
    {
        var regexp = /^([\+]?)([\d]{10,14})$/i;
        return regexp.test(string);
    },
    
    /**
     * Validates URL format
     * @param {string} string
     * @returns {boolean}
     */
    checkFormatUrl: function(string)
    {
        var regexp = /^([\w-\-]+)\.([\w-\&\?_\-\.\/=]+)$/i;
        return regexp.test(string);
    },
    
    /**
     * Validates number format
     * @param {string} string
     * @returns {boolean}
     */
    checkFormatNumber: function(string)
    {
        var regexp = /^([\d-]+)$/i;
        return regexp.test(string);
    },
    
    /**
     * Displays errors
     * @param {object} element
     * @param {string} error
     * @param {array} errors
     * @returns {undefined}     
     */
    displayErrors: function(element, error, errors)
    {
        var parent_element = element.parent();
        for (var i = 1; i <= 3; i++)
        {
            var message_element = parent_element.find('.with-errors');
            if (message_element.prop('tagName') !== undefined)
            {
                break;
            }
            parent_element = parent_element.parent();
        }
        
        if (error !== '')
        {
            message_element.html(error);
            message_element.show();
            parent_element.addClass('error');
        }
        else 
        {
            message_element.html('');
            message_element.hide();
            parent_element.removeClass('error');
            if (errors[element.prop('id')] !== undefined)
            {
                errors[element.prop('id')] = null;
            }
        }
    }
}

function recaptchaCallback(hash)
{
    var form = jQuery('#'+current_form_id);
    if (form.length !== 0)
    {
        form.unbind('submit');
	    var append_html = '<input type="hidden" name="g-recaptcha-response" value="'+hash+'">';
        form.append(append_html);
        
        current_form_id = null;
        form.submit();
    }
}

/*
 * Current form ID
 */
var current_form_id = null;

/*
 * reCAPTCHA widgets
 */
var recaptcha_widgets = [];

/* 
 * Translations of form error messages
 */
var fg_form_local = [];

fg_form_local['en'] = [];
fg_form_local['en']['empty'] = "This field is required";
fg_form_local['en']['format'] = "Wrong format";
fg_form_local['en']['chose'] = "Pick one";
fg_form_local['en']['long'] = "Value is too long";
fg_form_local['en']['big_file'] = "File is too big";

fg_form_local['fr'] = [];
fg_form_local['fr']['empty'] = "Ce champ est obligatoire";
fg_form_local['fr']['format'] = "Mauvais format";
fg_form_local['fr']['chose'] = "choisissez l'un";
fg_form_local['fr']['long'] = "La valeur est trop longue";
fg_form_local['fr']['big_file'] = "Le fichier est trop volumineux";

fg_form_local['es'] = [];
fg_form_local['es']['empty'] = "Este campo es obligatorio";
fg_form_local['es']['format'] = "Formato incorrecto";
fg_form_local['es']['chose'] = "Elegir";
fg_form_local['es']['long'] = "El valor es demasiado largo";
fg_form_local['es']['big_file'] = "El archivo es demasiado grande";

fg_form_local['ru'] = [];
fg_form_local['ru']['empty'] = "Это поле обязательно к заполнению";
fg_form_local['ru']['format'] = "Неверный формат";
fg_form_local['ru']['chose'] = "Сделайте ваш выбор";
fg_form_local['ru']['long'] = "Слишком длинное значение";
fg_form_local['ru']['big_file'] = "Файл слишком велик";