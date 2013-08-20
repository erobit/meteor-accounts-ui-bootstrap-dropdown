meteor-accounts-ui-bootstrap-dropdown
=====================================

Meteor accounts-ui styled with twitter/bootstrap dropdown

Prerequisites
-------------

Use the meteorite package manager
http://oortcloud.github.com/meteorite/

[sudo] npm install -g meteorite

How to add to your meteor app
-----------------------------

mrt add accounts-ui-bootstrap-dropdown
meteor add bootstrap
meteor add accounts-password

How to use
-------------

Add {{ loginButtons }} to your template

Add Accounts configuration to your javascript file

Accounts.ui.config({
	passwordSignupFields: 'USERNAME_AND_OPTIONAL_EMAIL'
});