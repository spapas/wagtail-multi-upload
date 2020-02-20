# wagtail-multi-upload

This panel can be used instead of an `InlinePanel` to help you upload multiple related images to your pages. 

This project is completely based on this PR: https://github.com/wagtail/wagtail/pull/4393 by @rajeev. For various reasons the PR hasn't been merged to wagtail core so
I just retrieved the files there and added them to this repository along with some installation instructions. Please notice that there are *many* duplicated things
because some basic functionality that this panel uses is actually missing from wagtail core so things needs to be duplicated.

This project has been mainly implemented to cover my requirements; I'll try to keep it updated with new wagtail versions but I can't promise anything. It should
work fine with *Wagtail 2.8*

Installation
------------

First of all install this using pip:

pip install git+https://github.com/spapas/wagtail-multi-upload.git

then add `"wagtail_multi_upload"` to your `settings.INSTALLED_APPS`. 

Finally, you *must* add a view to your urls.py like this:

```
from wagtail_multi_upload.views import add as add_multiple_fix
urlpatterns = [
    #... other views
    url(r"^multi-add-fix/", add_multiple_fix, name="add_multiple_fix"),
]
```

The last change is needed because the default multi-add view of wagtail won't return the correct information that this panel needs.

Usage
-----

After you've installed this, you can go to any one of your Pages that has related images and replace your `InlinePanel` with 
`MultipleImagesPanel`. The `MultipleImagesPanel` needs the `image_field_name` which is the name of the image field of your related image
model.

Here's a more complete example (from the wagtail tutorial):

```
# Other imports are the same
from wagtail_multi_upload.edit_handlers import MultipleImagesPanel


class BlogPage(Page):
    date = models.DateField("Post date")
    intro = models.CharField(max_length=250)
    body = RichTextField(blank=True)

    search_fields = Page.search_fields + [
        index.SearchField('intro'),
        index.SearchField('body'),
    ]

    content_panels = Page.content_panels + [
        FieldPanel('date'),
        FieldPanel('intro'),
        FieldPanel('body', classname="full"),
        #Change this 
        # InlinePanel('gallery_images', label="Gallery images"),
        # to this
        MultipleImagesPanel("gallery_images", label="Gallery images", image_field_name="image"),
    ]


class BlogPageGalleryImage(Orderable):
    page = ParentalKey(BlogPage, on_delete=models.CASCADE, related_name='gallery_images')
    image = models.ForeignKey(
        'wagtailimages.Image', on_delete=models.CASCADE, related_name='+'
    )
    caption = models.CharField(blank=True, max_length=250)

    panels = [
        ImageChooserPanel('image'),
        FieldPanel('caption'),
    ]
```    