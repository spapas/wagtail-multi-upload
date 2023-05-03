from wagtail.admin.panels import FieldPanel, InlinePanel
from wagtail.images import get_image_model
from django.forms.widgets import Media, MediaDefiningClass
from django.template.loader import render_to_string
from django.utils.safestring import mark_safe


def widget_with_script(widget, script):
    return mark_safe('{0}<script>{1}</script>'.format(widget, script))


class MultipleImagesPanel(InlinePanel):
    
    def __init__(self, relation_name, image_field_name, *args, **kwargs):
        kwargs['relation_name'] = relation_name
        super().__init__(*args, **kwargs)
        self.image_field_name = image_field_name

    def clone(self):
        # Need to track changes to this method in the InlinePanel class
        return self.__class__(
            relation_name=self.relation_name,
            image_field_name=self.image_field_name,
            panels=self.panels,
            heading=self.heading,
            label=self.label,
            help_text=self.help_text,
            min_num=self.min_num,
            max_num=self.max_num,
            classname=self.classname,
        )

    class BoundPanel(InlinePanel.BoundPanel):

        template = "wagtail_multi_upload/edit_handlers/multiple_images_panel.html"
        js_template = "wagtail_multi_upload/edit_handlers/multiple_images_panel.js"

        def render_html(self, *parent_context):
            
            context = {
                'self': self,
                'can_order': self.formset.can_order,
            }
            context.update(self.render_extension())
            formset = render_to_string(self.template, context)
            js = self.render_js_init()
            
            return widget_with_script(formset, js)

        def render_js_init(self):
            context = {
                'self': self,
                'can_order': self.formset.can_order,
            }
            context.update(self.render_extension_js_init())
            return mark_safe(render_to_string(self.js_template, context))

        def render_extension(self):
            from wagtail.images.permissions import permission_policy
            from wagtail.images.fields import get_allowed_image_extensions
            from wagtail.images.forms import get_image_form  

            Image = get_image_model()
            ImageForm = get_image_form(Image)

            collections_to_choose = None

            collections = permission_policy.collections_user_has_permission_for(self.request.user, 'add')
            if len(collections) > 1:
                collections_to_choose = collections
            else:
                # no need to show a collections chooser
                collections_to_choose = None

            form = ImageForm(user=self.request.user)

            return {
                'max_filesize': form.fields['file'].max_upload_size,
                'help_text': form.fields['file'].help_text,
                'allowed_extensions': get_allowed_image_extensions,
                'error_max_file_size': form.fields['file'].error_messages['file_too_large_unknown_size'],
                'error_accepted_file_types': form.fields['file'].error_messages['invalid_image'],
                'collections': collections_to_choose,
            }

        def render_extension_js_init(self):
            return self.render_extension()

        @property
        def media(self):
            return Media(js=[
                'wagtailimages/js/vendor/load-image.min.js',
                'wagtailimages/js/vendor/canvas-to-blob.min.js',
                'wagtailadmin/js/vendor/jquery.iframe-transport.js',
                'wagtailadmin/js/vendor/jquery.fileupload.js',
                'wagtailadmin/js/vendor/jquery.fileupload-process.js',
                'wagtailimages/js/vendor/jquery.fileupload-image.js',
                'wagtailimages/js/vendor/jquery.fileupload-validate.js',
                'wagtailadmin/js/vendor/tag-it.js'
            ], css={
                'screen': ('wagtail-multi-upload/css/add-multiple.css',)
            })
    