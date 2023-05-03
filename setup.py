#!/usr/bin/env python
from setuptools import setup, find_packages

#with open("README.md", "r") as fh:
#    long_description = fh.read()

setup(
    name='wagtail-multi-upload',
    version='0.2.1',
    description='',

    author='Serafeim Papastefanos',
    author_email='spapas@gmail.com',
    license='MIT',
    #long_description=long_description,
    #long_description_content_type="text/markdown",
    url='https://github.com/spapas/wagtail-multi-upload/',
    zip_safe=False,
    include_package_data=True,
    packages=find_packages(exclude=['tests.*', 'tests', 'sample', ]),

    classifiers=[
        'Environment :: Web Environment',
        'Programming Language :: Python',
        'Programming Language :: Python :: 3',
        'Programming Language :: Python :: 3.6',
        'Intended Audience :: Developers',
        'License :: OSI Approved :: MIT License',
        'Operating System :: OS Independent',
        'Programming Language :: Python',
        'Topic :: Software Development :: Libraries',
        'Topic :: Software Development :: Libraries :: Python Modules',
    ],
)
