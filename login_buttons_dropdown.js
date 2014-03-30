// for convenience
var loginButtonsSession = Accounts._loginButtonsSession;

// events shared between loginButtonsLoggedOutDropdown and
// loginButtonsLoggedInDropdown
Template._loginButtons.events({
  'click input, click label, click button, click .dropdown-menu, click .alert': function(event) {
    event.stopPropagation();
  },
  'click #login-name-link, click #login-sign-in-link': function () {
    event.stopPropagation();
    loginButtonsSession.set('dropdownVisible', true);
    Deps.flush();
  },
  'click .login-close': function () {
    loginButtonsSession.closeDropdown();
  }
});


//
// loginButtonsLoggedInDropdown template and related
//

Template._loginButtonsLoggedInDropdown.events({
  'click #login-buttons-open-change-password': function(event) {
    event.stopPropagation();
    loginButtonsSession.resetMessages();
    loginButtonsSession.set('inChangePasswordFlow', true);
    Deps.flush();
    toggleDropdown();
  }
});

Template._loginButtonsLoggedInDropdown.displayName = displayName;

Template._loginButtonsLoggedInDropdown.inChangePasswordFlow = function () {
  return loginButtonsSession.get('inChangePasswordFlow');
};

Template._loginButtonsLoggedInDropdown.inMessageOnlyFlow = function () {
  return loginButtonsSession.get('inMessageOnlyFlow');
};

Template._loginButtonsLoggedInDropdown.dropdownVisible = function () {
  return loginButtonsSession.get('dropdownVisible');
};

Template._loginButtonsLoggedInDropdownActions.allowChangingPassword = function () {
  // it would be more correct to check whether the user has a password set,
  // but in order to do that we'd have to send more data down to the client,
  // and it'd be preferable not to send down the entire service.password document.
  //
  // instead we use the heuristic: if the user has a username or email set.
  var user = Meteor.user();
  return user.username || (user.emails && user.emails[0] && user.emails[0].address);
};


//
// loginButtonsLoggedOutDropdown template and related
//

Template._loginButtonsLoggedOutDropdown.events({
  'click #login-buttons-password': function () {
    loginOrSignup();
  },

  'keypress #forgot-password-email': function (event) {
    if (event.keyCode === 13)
      forgotPassword();
  },

  'click #login-buttons-forgot-password': function (event) {
    event.stopPropagation();
    forgotPassword();
  },

  'click #signup-link': function (event) {
    event.stopPropagation();
    loginButtonsSession.resetMessages();

    // store values of fields before swtiching to the signup form
    var username = trimmedElementValueById('login-username');
    var email = trimmedElementValueById('login-email');
    var usernameOrEmail = trimmedElementValueById('login-username-or-email');
    // notably not trimmed. a password could (?) start or end with a space
    var password = elementValueById('login-password');

    loginButtonsSession.set('inSignupFlow', true);
    loginButtonsSession.set('inForgotPasswordFlow', false);
    
    // force the ui to update so that we have the approprate fields to fill in
    Deps.flush();

    // update new fields with appropriate defaults
    if (username !== null)
      document.getElementById('login-username').value = username;
    else if (email !== null)
      document.getElementById('login-email').value = email;
    else if (usernameOrEmail !== null)
      if (usernameOrEmail.indexOf('@') === -1)
        document.getElementById('login-username').value = usernameOrEmail;
    else
      document.getElementById('login-email').value = usernameOrEmail;
  },
  'click #forgot-password-link': function (event) {
    event.stopPropagation();
    loginButtonsSession.resetMessages();

    // store values of fields before swtiching to the signup form
    var email = trimmedElementValueById('login-email');
    var usernameOrEmail = trimmedElementValueById('login-username-or-email');

    loginButtonsSession.set('inSignupFlow', false);
    loginButtonsSession.set('inForgotPasswordFlow', true);
    
    // force the ui to update so that we have the approprate fields to fill in
    Deps.flush();
    //toggleDropdown();

    // update new fields with appropriate defaults
    if (email !== null)
      document.getElementById('forgot-password-email').value = email;
    else if (usernameOrEmail !== null)
      if (usernameOrEmail.indexOf('@') !== -1)
        document.getElementById('forgot-password-email').value = usernameOrEmail;
  },
  'click #back-to-login-link': function () {
    loginButtonsSession.resetMessages();

    var username = trimmedElementValueById('login-username');
    var email = trimmedElementValueById('login-email')
          || trimmedElementValueById('forgot-password-email'); // Ughh. Standardize on names?

    loginButtonsSession.set('inSignupFlow', false);
    loginButtonsSession.set('inForgotPasswordFlow', false);
    // force the ui to update so that we have the approprate fields to fill in
    Deps.flush();

    if (document.getElementById('login-username'))
      document.getElementById('login-username').value = username;
    if (document.getElementById('login-email'))
      document.getElementById('login-email').value = email;
    // "login-password" is preserved thanks to the preserve-inputs package
    if (document.getElementById('login-username-or-email'))
      document.getElementById('login-username-or-email').value = email || username;
  },
  'keypress #login-username, keypress #login-email, keypress #login-username-or-email, keypress #login-password, keypress #login-password-again': function (event) {
    if (event.keyCode === 13)
      loginOrSignup();
  }
});

// additional classes that can be helpful in styling the dropdown
Template._loginButtonsLoggedOutDropdown.additionalClasses = function () {
  if (!hasPasswordService()) {
    return false;
  } else {
    if (loginButtonsSession.get('inSignupFlow')) {
      return 'login-form-create-account';
    } else if (loginButtonsSession.get('inForgotPasswordFlow')) {
      return 'login-form-forgot-password';
    } else {
      return 'login-form-sign-in';
    }
  }
};

Template._loginButtonsLoggedOutDropdown.dropdownVisible = function () {
  return loginButtonsSession.get('dropdownVisible');
};

Template._loginButtonsLoggedOutDropdown.hasPasswordService = hasPasswordService;

// return all login services, with password last
Template._loginButtonsLoggedOutAllServices.services = getLoginServices;

Template._loginButtonsLoggedOutAllServices.isPasswordService = function () {
  return this.name === 'password';
};

Template._loginButtonsLoggedOutAllServices.hasOtherServices = function () {
  return getLoginServices().length > 1;
};

Template._loginButtonsLoggedOutAllServices.hasPasswordService = 
  hasPasswordService;

Template._loginButtonsLoggedOutPasswordService.fields = function () {
  var loginFields = [
    {fieldName: 'username-or-email', fieldLabel: 'Username or Email',
     visible: function () {
       return _.contains(
         ["USERNAME_AND_EMAIL", "USERNAME_AND_OPTIONAL_EMAIL"],
         passwordSignupFields());
     }},
    {fieldName: 'username', fieldLabel: 'Username',
     visible: function () {
       return passwordSignupFields() === "USERNAME_ONLY";
     }},
    {fieldName: 'email', fieldLabel: 'Email', inputType: 'email',
     visible: function () {
       return passwordSignupFields() === "EMAIL_ONLY";
     }},
    {fieldName: 'password', fieldLabel: 'Password', inputType: 'password',
     visible: function () {
       return true;
     }}
  ];

  var signupFields = [
    {fieldName: 'username', fieldLabel: 'Username',
     visible: function () {
       return _.contains(
         ["USERNAME_AND_EMAIL", "USERNAME_AND_OPTIONAL_EMAIL", "USERNAME_ONLY"],
         passwordSignupFields());
     }},
    {fieldName: 'email', fieldLabel: 'Email', inputType: 'email',
     visible: function () {
       return _.contains(
         ["USERNAME_AND_EMAIL", "EMAIL_ONLY"],
         passwordSignupFields());
     }},
    {fieldName: 'email', fieldLabel: 'Email (optional)', inputType: 'email',
     visible: function () {
       return passwordSignupFields() === "USERNAME_AND_OPTIONAL_EMAIL";
     }},
    {fieldName: 'password', fieldLabel: 'Password', inputType: 'password',
     visible: function () {
       return true;
     }},
    {fieldName: 'password-again', fieldLabel: 'Password (again)',
     inputType: 'password',
     visible: function () {
       // No need to make users double-enter their password if
       // they'll necessarily have an email set, since they can use
       // the "forgot password" flow.
       return _.contains(
         ["USERNAME_AND_OPTIONAL_EMAIL", "USERNAME_ONLY"],
         passwordSignupFields());
     }}
  ];

  return loginButtonsSession.get('inSignupFlow') ? signupFields : loginFields;
};

Template._loginButtonsLoggedOutPasswordService.inForgotPasswordFlow = function () {
  return loginButtonsSession.get('inForgotPasswordFlow');
};

Template._loginButtonsLoggedOutPasswordService.inLoginFlow = function () {
  return !loginButtonsSession.get('inSignupFlow') && !loginButtonsSession.get('inForgotPasswordFlow');
};

Template._loginButtonsLoggedOutPasswordService.inSignupFlow = function () {
  return loginButtonsSession.get('inSignupFlow');
};

Template._loginButtonsLoggedOutPasswordService.showCreateAccountLink = function () {
  return !Accounts._options.forbidClientAccountCreation;
};

Template._loginButtonsLoggedOutPasswordService.showForgotPasswordLink = function () {
  return _.contains(
    ["USERNAME_AND_EMAIL", "USERNAME_AND_OPTIONAL_EMAIL", "EMAIL_ONLY"],
    passwordSignupFields());
};

Template._loginButtonsFormField.inputType = function () {
  return this.inputType || "text";
};


//
// loginButtonsChangePassword template
//

Template._loginButtonsChangePassword.events({
  'keypress #login-old-password, keypress #login-password, keypress #login-password-again': function (event) {
    if (event.keyCode === 13)
      changePassword();
  },
  'click #login-buttons-do-change-password': function (event) {
    event.stopPropagation();
    changePassword();
  }
});

Template._loginButtonsChangePassword.fields = function () {
  return [
    {fieldName: 'old-password', fieldLabel: 'Current Password', inputType: 'password',
     visible: function () {
       return true;
     }},
    {fieldName: 'password', fieldLabel: 'New Password', inputType: 'password',
     visible: function () {
       return true;
     }},
    {fieldName: 'password-again', fieldLabel: 'New Password (again)',
     inputType: 'password',
     visible: function () {
       // No need to make users double-enter their password if
       // they'll necessarily have an email set, since they can use
       // the "forgot password" flow.
       return _.contains(
         ["USERNAME_AND_OPTIONAL_EMAIL", "USERNAME_ONLY"],
         passwordSignupFields());
     }}
  ];
};


//
// helpers
//

var elementValueById = function(id) {
  var element = document.getElementById(id);
  if (!element)
    return null;
  else
    return element.value;
};

var trimmedElementValueById = function(id) {
  var element = document.getElementById(id);
  if (!element)
    return null;
  else
    return element.value.replace(/^\s*|\s*$/g, ""); // trim() doesn't work on IE8;
};

var loginOrSignup = function () {
  if (loginButtonsSession.get('inSignupFlow'))
    signup();
  else
    login();
};

var login = function () {
  loginButtonsSession.resetMessages();

  var username = trimmedElementValueById('login-username');
  var email = trimmedElementValueById('login-email');
  var usernameOrEmail = trimmedElementValueById('login-username-or-email');
  // notably not trimmed. a password could (?) start or end with a space
  var password = elementValueById('login-password');

  var loginSelector;
  if (username !== null) {
    if (!validateUsername(username))
      return;
    else
      loginSelector = {username: username};
  } else if (email !== null) {
    if (!validateEmail(email))
      return;
    else
      loginSelector = {email: email};
  } else if (usernameOrEmail !== null) {
    // XXX not sure how we should validate this. but this seems good enough (for now),
    // since an email must have at least 3 characters anyways
    if (!validateUsername(usernameOrEmail))
      return;
    else
      loginSelector = usernameOrEmail;
  } else {
    throw new Error("Unexpected -- no element to use as a login user selector");
  }

  Meteor.loginWithPassword(loginSelector, password, function (error, result) {
    if (error) {
      loginButtonsSession.errorMessage(error.reason || "Unknown error");
    } else {
      loginButtonsSession.closeDropdown();
    }
  });
};

var toggleDropdown = function() {
  $('#login-dropdown-list .dropdown-menu').dropdown('toggle');
};

var signup = function () {
  loginButtonsSession.resetMessages();

  var options = {}; // to be passed to Accounts.createUser

  var username = trimmedElementValueById('login-username');
  if (username !== null) {
    if (!validateUsername(username))
      return;
    else
      options.username = username;
  }

  var email = trimmedElementValueById('login-email');
  if (email !== null) {
    if (!validateEmail(email))
      return;
    else
      options.email = email;
  }

  // notably not trimmed. a password could (?) start or end with a space
  var password = elementValueById('login-password');
  if (!validatePassword(password))
    return;
  else
    options.password = password;

  if (!matchPasswordAgainIfPresent())
    return;

  Accounts.createUser(options, function (error) {
    if (error) {
      loginButtonsSession.errorMessage(error.reason || "Unknown error");
    } else {
      loginButtonsSession.closeDropdown();
    }
  });
};

var forgotPassword = function () {
  loginButtonsSession.resetMessages();

  var email = trimmedElementValueById("forgot-password-email");
  if (email.indexOf('@') !== -1) {
    Accounts.forgotPassword({email: email}, function (error) {
      if (error)
        loginButtonsSession.errorMessage(error.reason || "Unknown error");
      else
        loginButtonsSession.infoMessage("Email sent");
    });
  } else {
    loginButtonsSession.infoMessage("Email sent");
  }
};

var changePassword = function () {
  loginButtonsSession.resetMessages();

  // notably not trimmed. a password could (?) start or end with a space
  var oldPassword = elementValueById('login-old-password');

  // notably not trimmed. a password could (?) start or end with a space
  var password = elementValueById('login-password');
  if (!validatePassword(password))
    return;

  if (!matchPasswordAgainIfPresent())
    return;

  Accounts.changePassword(oldPassword, password, function (error) {
    if (error) {
       loginButtonsSession.errorMessage(error.reason || "Unknown error");
    } else {
      loginButtonsSession.infoMessage("Password changed");

      // wait 3 seconds, then expire the msg
      Meteor.setTimeout(function() {
        loginButtonsSession.resetMessages();
      }, 3000);
      // loginButtonsSession.set('inChangePasswordFlow', false);
      // loginButtonsSession.set('inMessageOnlyFlow', true);
      // loginButtonsSession.infoMessage("Password changed");
    }
  });
};

var matchPasswordAgainIfPresent = function () {
  // notably not trimmed. a password could (?) start or end with a space
  var passwordAgain = elementValueById('login-password-again');
  if (passwordAgain !== null) {
    // notably not trimmed. a password could (?) start or end with a space
    var password = elementValueById('login-password');
    if (password !== passwordAgain) {
      loginButtonsSession.errorMessage("Passwords don't match");
      return false;
    }
  }
  return true;
};
