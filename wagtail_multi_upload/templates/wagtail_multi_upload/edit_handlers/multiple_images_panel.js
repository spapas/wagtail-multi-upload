{% load l10n %}
{% load wagtailadmin_tags %}

{% url 'wagtailadmin_tag_autocomplete' as autocomplete_url %}

$(document).bind('drop dragover', function (e) {
    e.preventDefault();
});


function createUnBoundImageChooser(id) {
    var chooserElement = $('#' + id + '-chooser');
    
    previewImage = chooserElement.find('.chosen img');
    
    var input = $('#' + id);
    var editLink = chooserElement.find('.edit-link');
    
    var imageChosenCallback = function(imageData) {
        input.val(imageData.id);
        previewImage.attr({
            src: imageData.preview.url,
            width: imageData.preview.width,
            height: imageData.preview.height,
            alt: imageData.title,
            title: imageData.title
        });
        editLink.attr('href', imageData.edit_link);
        chooserElement.removeClass('blank');
    }
    if (typeof ImageChooser === 'function') {
        // Wagtail 4.x automatically initializes the ModalWorkflow 
    } else {
        $('.action-choose', chooserElement).on('click', function() {
            var chooserUrl = chooserElement.data('chooserUrl')?chooserElement.data('chooserUrl'):window.chooserUrls.imageChooser
            ModalWorkflow({
                url: chooserUrl,
                onload: IMAGE_CHOOSER_MODAL_ONLOAD_HANDLERS,
                responses: {
                    imageChosen: function(imageData) {
                        input.val(imageData.id);
                        previewImage.attr({
                            src: imageData.preview.url,
                            width: imageData.preview.width,
                            height: imageData.preview.height,
                            alt: imageData.title,
                            title: imageData.title
                        });
                        chooserElement.removeClass('blank');
                        editLink.attr('href', imageData.edit_link);
                        

                    }
                }
            });
        });
        
        $('.action-clear', chooserElement).on('click', function() {
            input.val('');
            chooserElement.addClass('blank');
        });
}

    return imageChosenCallback;
}


class BetterImageChooser extends ImageChooser {
    initHTMLElements(id) {
        if ($('#'+id).parents('.multiple').length) {

            $('#' + id).data('imageChooser', createUnBoundImageChooser(id));
            super.initHTMLElements(id);
        } else {

            super.initHTMLElements(id);
        }
    }
}
window.ImageChooser = BetterImageChooser


function modCreateImageChooser(id) {
    if ($('#'+id).parents('.multiple').length) {
        $('#' + id).data('imageChooser', createUnBoundImageChooser(id));
    } else {
        return originalcreateImageChooser(id);
    }
}



function buildExpandingFormset(prefix, opts) {
    if (!opts) {
        opts = {};
    }

    var addButton = $('#' + prefix + '-ADD');
    var formContainer = $('#' + prefix + '-FORMS');
    var totalFormsInput = $('#' + prefix + '-TOTAL_FORMS');
    var formCount = parseInt(totalFormsInput.val(), 10);

    if (opts.onInit) {
        for (var i = 0; i < formCount; i++) {
            opts.onInit(i);
        }
    }

    var emptyFormTemplate = document.getElementById(prefix + '-EMPTY_FORM_TEMPLATE');
    if (emptyFormTemplate.innerText) {
        emptyFormTemplate = emptyFormTemplate.innerText;
    } else if (emptyFormTemplate.textContent) {
        emptyFormTemplate = emptyFormTemplate.textContent;
    }

    var add = function() {
        if (addButton.hasClass('disabled')) return false;
        var newFormHtml = emptyFormTemplate
            .replace(/__prefix__/g, formCount)
            .replace(/<-(-*)\/script>/g, '<$1/script>');
        formContainer.append(newFormHtml);
        if (opts.onAdd) opts.onAdd(formCount);
        if (opts.onInit) opts.onInit(formCount);

        formCount++;
        totalFormsInput.val(formCount);
        return formCount - 1;
    }

    addButton.on('click', add);

    return add;
}

function InlinePanel(opts) {
    var self = {};

    self.setHasContent = function() {
        if ($('> li', self.formsUl).not('.deleted').length) {
            self.formsUl.parent().removeClass('empty');
        } else {
            self.formsUl.parent().addClass('empty');
        }
    };

    self.initChildControls = function(prefix) {
        var childId = 'inline_child_' + prefix;
        var deleteInputId = 'id_' + prefix + '-DELETE';

        //mark container as having children to identify fields in use from those not
        self.setHasContent();

        $('#' + deleteInputId + '-button').on('click', function() {
            /* set 'deleted' form field to true */
            $('#' + deleteInputId).val('1');
            $('#' + childId).addClass('deleted').slideUp(function() {
                self.updateMoveButtonDisabledStates();
                self.updateAddButtonState();
                self.setHasContent();
            });
        });

        if (opts.canOrder) {
            var currentChild = $('#' + childId);
            currentChild.find('[data-inline-panel-child-move-up]').on('click', function() {
                const currentChildOrderElem = currentChild.find(
                    `input[name="${prefix}-ORDER"]`,
                );
                const currentChildOrder = currentChildOrderElem.val();
                const prevChild = currentChild.prevAll(':not(.deleted)').first();
                if (!prevChild.length) return;
                const prevChildPrefix = prevChild[0].id.replace('inline_child_', '');
                const prevChildOrderElem = prevChild.find(
                `input[name="${prevChildPrefix}-ORDER"]`,
                );
                const prevChildOrder = prevChildOrderElem.val();

                // async swap animation must run before the insertBefore line below, but doesn't need to finish first
                self.animateSwap(currentChild, prevChild);

                currentChild.insertBefore(prevChild);
                currentChildOrderElem.val(prevChildOrder);
                prevChildOrderElem.val(currentChildOrder);

                self.updateMoveButtonDisabledStates();
                
            });

            currentChild.find('[data-inline-panel-child-move-down]').on('click', function() {
                const currentChildOrderElem = currentChild.find(
                    `input[name="${prefix}-ORDER"]`,
                  );
                const currentChildOrder = currentChildOrderElem.val();
        
                /* find the next visible 'inline_child' li after this one */
                const nextChild = currentChild.nextAll(':not(.deleted)').first();
                if (!nextChild.length) return;
                const nextChildPrefix = nextChild[0].id.replace('inline_child_', '');
                const nextChildOrderElem = nextChild.find(
                `input[name="${nextChildPrefix}-ORDER"]`,
                );
                const nextChildOrder = nextChildOrderElem.val();
        
                // async swap animation must run before the insertAfter line below, but doesn't need to finish first
                self.animateSwap(currentChild, nextChild);
        
                currentChild.insertAfter(nextChild);
                currentChildOrderElem.val(nextChildOrder);
                nextChildOrderElem.val(currentChildOrder);
        
                self.updateMoveButtonDisabledStates();              
            });
        }

        /* Hide container on page load if it is marked as deleted. Remove the error
         message so that it doesn't count towards the number of errors on the tab at the
         top of the page. */
        if ($('#' + deleteInputId).val() === '1') {
            $('#' + childId).addClass('deleted').hide(0, function() {
                self.updateMoveButtonDisabledStates();
                self.updateAddButtonState();
                self.setHasContent();
            });

            $('#' + childId).find('.error-message').remove();
        }
    };

    self.formsUl = $('#' + opts.formsetPrefix + '-FORMS');

    self.updateMoveButtonDisabledStates = function() {
        if (opts.canOrder) {
            var forms = self.formsUl.children('li:not(.deleted)');
            forms.each(function(i) {
                $('ul.controls .inline-child-move-up', this).toggleClass('disabled', i === 0).toggleClass('enabled', i !== 0);
                $('ul.controls .inline-child-move-down', this).toggleClass('disabled', i === forms.length - 1).toggleClass('enabled', i != forms.length - 1);
            });
        }
    };

    self.updateAddButtonState = function() {
        if (opts.maxForms) {
            var forms = $('> li', self.formsUl).not('.deleted');
            var addButton = $('#' + opts.formsetPrefix + '-ADD');

            if (forms.length >= opts.maxForms) {
                addButton.addClass('disabled');
            } else {
                addButton.removeClass('disabled');
            }
        }
    };

    self.animateSwap = function(item1, item2) {
        var parent = self.formsUl;
        var children = parent.children('li:not(.deleted)');

        // Apply moving class to container (ul.multiple) so it can assist absolute positioning of it's children
        // Also set it's relatively calculated height to be an absolute one, to prevent the container collapsing while its children go absolute
        parent.addClass('moving').css('height', parent.height());

        children.each(function() {
            $(this).css('top', $(this).position().top);
        }).addClass('moving');

        // animate swapping around
        item1.animate({
            top:item2.position().top
        }, 200, function() {
            parent.removeClass('moving').removeAttr('style');
            children.removeClass('moving').removeAttr('style');
        });

        item2.animate({
            top:item1.position().top
        }, 200, function() {
            parent.removeClass('moving').removeAttr('style');
            children.removeClass('moving').removeAttr('style');
        });
    };

    self.addOne = buildExpandingFormset(opts.formsetPrefix, {
        onAdd: function(formCount) {
            var newChildPrefix = opts.emptyChildFormPrefix.replace(/__prefix__/g, formCount);
            self.initChildControls(newChildPrefix);
            if (opts.canOrder) {
                /* NB form hidden inputs use 0-based index and only increment formCount *after* this function is run.
                Therefore formcount and order are currently equal and order must be incremented
                to ensure it's *greater* than previous item */
                $('#id_' + newChildPrefix + '-ORDER').val(formCount + 1);
            }

            self.updateMoveButtonDisabledStates();
            self.updateAddButtonState();

            if (opts.onAdd) opts.onAdd();
        }
    });

    self.formsElt = $('#' + opts.formsetPrefix + '-FORMS');

    self.animateSwap = function animateSwap(item1, item2) {
        const parent = self.formsElt;
        const children = parent.children(':not(.deleted)');
    
        // Position children absolutely and add hard-coded height
        // to prevent scroll jumps when reordering.
        parent.css({
          position: 'relative',
          height: parent.height(),
        });
    
        children
          .each(function moveChildTop() {
            $(this).css('top', $(this).position().top);
          })
          .css({
            // Set this after the actual position so the items animate correctly.
            position: 'absolute',
            width: '100%',
          });
    
        // animate swapping around
        item1.animate(
          {
            top: item2.position().top,
          },
          200,
          () => {
            parent.removeAttr('style');
            children.removeAttr('style');
          },
        );
    
        item2.animate(
          {
            top: item1.position().top,
          },
          200,
          () => {
            parent.removeAttr('style');
            children.removeAttr('style');
          },
        );
      };

    return self;
}



(function() {
    var formsetPrefix = "id_{{ self.formset.prefix }}";
    var emptyChildFormPrefix = "{{ self.empty_child.form.prefix }}";
    var canOrder = {% if can_order %}true{% else %}false{% endif %};


    var panel = InlinePanel({
        formsetPrefix: formsetPrefix,
        emptyChildFormPrefix: emptyChildFormPrefix,
        canOrder: canOrder,
        maxForms: {{ self.formset.max_num|unlocalize }}
    });

    {% for child in self.children %}
        panel.initChildControls("{{ child.form.prefix }}");
    {% endfor %}
    panel.setHasContent();
    panel.updateMoveButtonDisabledStates();
    panel.updateAddButtonState();


    window.fileupload_opts = {
        simple_upload_url: "{% url 'wagtailimages:add' %}",
        accepted_file_types: /\.({{ allowed_extensions|join:"|" }})$/i, //must be regex
        max_file_size: {{ max_filesize|stringformat:"s"|default:"null" }}, //numeric format
        errormessages: {
            max_file_size: "{{ error_max_file_size }}",
            accepted_file_types: "{{ error_accepted_file_types }}"
        }
    }
    window.tagit_opts = {
        autocomplete: {source: "{{ autocomplete_url|addslashes }}"}
    };

    $('#{{self.formset.prefix}}-fileupload').fileupload({
        dataType: 'html',
        url: $('#{{self.formset.prefix}}-fileupload').data('url'),
        sequentialUploads: true,
        dropZone: $('.drop-zone'),
        acceptFileTypes: window.fileupload_opts.accepted_file_types,
        maxFileSize: window.fileupload_opts.max_file_size,
        previewMinWidth:150,
        previewMaxWidth:150,
        previewMinHeight:150,
        previewMaxHeight:150,
        messages: {
            acceptFileTypes: window.fileupload_opts.errormessages.accepted_file_types,
            maxFileSize: window.fileupload_opts.errormessages.max_file_size
        },
        add: function(e, data) {
            $('.messages').empty();
            var $this = $(this);
            var that = $this.data('blueimp-fileupload') || $this.data('fileupload')
            var li = $($('#{{self.formset.prefix}}-upload-list-item').html()).addClass('upload-uploading')
            var options = that.options;

            $('#{{self.formset.prefix}}-upload-list').append(li);
            data.context = li;

            data.process(function() {
                return $this.fileupload('process', data);
            }).always(function() {
                data.context.removeClass('processing');
                data.context.find('.left').each(function(index, elm) {
                    $(elm).append(escapeHtml(data.files[index].name));
                });

                data.context.find('.preview .thumb').each(function(index, elm) {
                    $(elm).addClass('hasthumb')
                    $(elm).append(data.files[index].preview);
                });

            }).done(function() {
                data.context.find('.start').prop('disabled', false);
                if ((that._trigger('added', e, data) !== false) &&
                        (options.autoUpload || data.autoUpload) &&
                        data.autoUpload !== false) {
                    data.submit()
                }
            }).fail(function() {
                if (data.files.error) {
                    data.context.each(function(index) {
                        var error = data.files[index].error;
                        if (error) {
                            $(this).find('.error_messages').text(error);
                        }
                    });
                }
            });
        },

        processfail: function(e, data) {
            var itemElement = $(data.context);
            itemElement.removeClass('upload-uploading').addClass('upload-failure');
        },

        progress: function(e, data) {
            if (e.isDefaultPrevented()) {
                return false;
            }

            var progress = Math.floor(data.loaded / data.total * 100);
            data.context.each(function() {
                $(this).find('.progress').addClass('active').attr('aria-valuenow', progress).find('.bar').css(
                    'width',
                    progress + '%'
                ).html(progress + '%');
            });
        },

        progressall: function(e, data) {
            var progress = parseInt(data.loaded / data.total * 100, 10);
            $('#{{self.formset.prefix}}-overall-progress').addClass('active').attr('aria-valuenow', progress).find('.bar').css(
                'width',
                progress + '%'
            ).html(progress + '%');

            if (progress >= 100) {
                $('#{{self.formset.prefix}}-overall-progress').removeClass('active').find('.bar').css('width', '0%');
            }
        },

        done: function(e, data) {
            var itemElement = $(data.context);
            var response = JSON.parse(data.result);

            if (response.success) {
                itemElement.addClass('upload-success');
                
                var prefixId = panel.addOne();
                var imageFieldId = 'id_{{ self.formset.prefix }}-'+prefixId+'-{{self.panel.image_field_name}}'
                
                var imageField = $('#' + imageFieldId);
                
                var imageChosen = imageField.data('imageChooser');
                
                imageChosen(response.image);

            } else {
                itemElement.addClass('upload-failure');
                $('.right .error_messages', itemElement).append(response.error_message);
            }

        },

        fail: function(e, data) {
            var itemElement = $(data.context);
            var errorMessage = $('.server-error', itemElement);
            $('.error-text', errorMessage).text(data.errorThrown);
            $('.error-code', errorMessage).text(data.jqXHR.status);

            itemElement.addClass('upload-server-error');
        },

        always: function(e, data) {
            var itemElement = $(data.context);
            itemElement.removeClass('upload-uploading').addClass('upload-complete');
        }
    });

    // ajax-enhance forms added on done()
    $('#{{self.formset.prefix}}-upload-list').on('submit', 'form', function(e) {
        var form = $(this);
        var itemElement = form.closest('#{{self.formset.prefix}}-upload-list > li');

        e.preventDefault();

        $.post(this.action, form.serialize(), function(data) {
            if (data.success) {
                var statusText = $('.status-msg.update-success').text();
                addMessage('success', statusText);
                itemElement.slideUp(function() {$(this).remove()});
            } else {
                form.replaceWith(data.form);

                // run tagit enhancement on new form
                $('.tag_field input', form).tagit(window.tagit_opts);
            }
        });
    });

    $('#{{self.formset.prefix}}-upload-list').on('click', '.delete', function(e) {
        var form = $(this).closest('form');
        var itemElement = form.closest('#upload-list > li');

        e.preventDefault();

        var CSRFToken = $('input[name="csrfmiddlewaretoken"]', form).val();

        $.post(this.href, {csrfmiddlewaretoken: CSRFToken}, function(data) {
            if (data.success) {
                itemElement.slideUp(function() {$(this).remove()});
            }
        });
    });

})();