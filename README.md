# qjide

The qjide (Qooxdoo J Integrated Development Environment) is:

* A web browser based IDE for the J programming language with a local web application server,

* As well as a simple and easy way to create single page web applications (SPA) without coding a sinlge line of HTML and CSS.

qjide includes the "web window driver" (WWD) which contains a rich set of desktop class widgets (gui elements) as well as a layout engine to create great looking desktop-like web applications.

For an overview of the gui widgets provided by WWD, please see the file WWD.pdf included in this repository.

For more information, and screenshots please see: [http://code.jsoftware.com/wiki/Scripts/qjide](http://code.jsoftware.com/wiki/Scripts/qjide)

## Installation

* Download the repository into a directory named "qjide"

* Edit qjide.cfg to specify your J installation location

## Frontend and Web Window Driver

The subdirectory qooxdoo contains all the web stuff.

Download the latest Qooxdoo SDK from [qooxdoo.org](http://qooxdoo.org). Copy the directory "qjide" under \<repository\>/qooxdoo to the "application" directory of the qooxdoo SDK. After a modification/recompilation, copy all the stuff under \<qooxdoo-sdk\>/application/build to \<repository\>/webapp.
