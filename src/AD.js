function AD(_username, _password, _ldap) {
    var Q = require('q'),
        ActiveDirectory = require('activedirectory'),
        result = {};

    result.ldap = _ldap || "ldap://10.130.214.13";
    result.bAuthenticated = false;
    result.username = _username;
    result.password = _password;

    /**
     * Kullanıcı adı bir eposta adresi olarak gelmiş ve fmc-ag.com varsa fresenius.com.tr ye çevirir
     * Gelmemişse (cem.topkaya gibi mesela) eğer, fresenius.com.tr'li AD adına çevirir (cem.topkaya@fresenius.com.tr gibi)
     */
    var f_check_username = function () {
        if (result.username.indexOf('@') == -1) {
            result.username += "@fresenius.com.tr";
        } else {
            if (result.username.indexOf('@fmc-ag.com') != -1) {
                result.username.replace('@fmc-ag.com', '@fresenius.com.tr');
            }
        }
    };

    f_check_username();

    result.ad = new ActiveDirectory(
        {
            url: result.ldap,
            baseDN: 'DC=fresenius,DC=com,DC=tr',
            username: result.username,
            password: result.password,
            attributes: {
                user: [
                    'userPrincipalName', 'sAMAccountName', /*'objectSID',*/ 'mail',
                    'lockoutTime', 'whenCreated', 'pwdLastSet', 'userAccountControl',
                    'employeeID', 'sn', 'givenName', 'initials', 'cn', 'displayName',
                    'comment', 'description', 'pager'
                ]
            }
        });

    result.f_AD = function () {
        return new ActiveDirectory(
            {
                url: result.ldap,
//                baseDN: 'CN=user,CN=users,OU=group,DC=domain,DC=com',
//                baseDN: 'CN=user,CN=users',
                username: result.user + "@fresenius.com.tr",
                password: result.pass
            });
    };

    result.f_Auth = function (_user, _pass, _callback) {
        var user = _user || result.username,
            pass = _pass || result.password,
            defer = Q.defer();
        console.log("geldi");
        f_check_username();
        console.log("chek_username sonucunda> user:%s pass:%s", user, pass);
        result.ad.authenticate(user, pass, function (err, auth) {
            console.log("Authenticate sonucu geldi1");
            if (err) {
                console.error("f_Auth hata");
                result.bAuthenticated = false;
                //console.log("ERROR: " + user + " ->" + JSON.stringify(err));
                if(_callback) _callback(err);
                defer.reject(err);
            }else {
                l.i("authenticate oldu!!!");
                result.bAuthenticated = auth;
                result.f_FindUser(user)
                    .then(function (_foundUser) {
                        //console.log("Found User: "+ JSON.stringify(_foundUser));
                        if(_callback) _callback(null, _foundUser);
                        defer.resolve(_foundUser);
                    })
                    .fail(function (_err) {
                        //console.log("Found User ERROR: "+_err);
                        if(_callback) _callback(_err);
                        defer.reject("Found User ERROR: " + _err);
                    });
            }
        });
        console.log("chek_username sonucunda> user:%s pass:%s", user, pass);
        return defer.promise;
    };

    result.f_isExist = function (_user) {
        if (_user && _user.indexOf("fresenius.com.tr") == -1) {
            _user += "@fresenius.com.tr";
        }
        return result.ad.userExists(_user, function (err, exists) {
            if (err) {
                console.log('ERROR: ' + JSON.stringify(err));
                return;
            }
            console.log(result.user + ' exists: ' + exists);
        });
    };


    // Find user by a sAMAccountName
    result.f_FindUser = function (_username) {
        var defer = Q.defer();
        var username = _username || result.username;

        //console.log("Will find user: " + username);
        result.ad.findUser(username, function (_err, _user) {
            if (_err) {
                //console.log('Active Directory Find User ERROR: ' + JSON.stringify(_err));
                defer.reject(_err);
            } else {
                defer.resolve(_user);
            }
        });
        return defer.promise;
    };


    result.f_findUsers = function (_username) {
        var opts = {
                filter: '(&(objectClass=user)(cn=' + _username + '*))',
                includeMembership: ['user'],
                attributes: ['cn', 'givenName', 'sn', 'description', 'userAccountControl',
                    'userPrincipalName', 'mail', 'sAMAccountName', 'telephoneNumber', 'otherTelephone', 'pager', 'mobile', 'facsimileTelephoneNumber']
            },
            defer = Q.defer();

        result.ad.findUsers(opts, true, function (err, users) {
            if (err) {
                var hata = 'ERROR: ' + JSON.stringify(err);
                console.log(hata);
                defer.reject(hata);
            } else {
                console.log(JSON.stringify(users));
                defer.resolve(users);
            }
        });

        return defer.promise;
    };

    return result;
}

module.exports = AD;