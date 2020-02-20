# wagtail-multi-upload

This panel can be used instead of an `InlinePanel` to help you upload multiple related images to your models. 

This project is completely based on this PR: https://github.com/wagtail/wagtail/pull/4393 by @rajeev. For various reasons the PR hasn't been merged to wagtail core so
I just retrieved the files there and added them to this repository along with some installation instructions. Please notice that there are *many* duplicated things
because some basic functionality that this panel uses is actually missing from wagtail core so things needs to be duplicated.

This project has been mainly implemented to cover my requirements; I'll try to keep it updated with new wagtail versions but I can't promise anything. It should
work fine with *Wagtail 2.8*

Installation
------------

First of all install this using pip:

pip install git+https://github.com/spapas/wagtail-multi-upload