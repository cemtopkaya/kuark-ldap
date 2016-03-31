/**
 * Created by cem.topkaya on 16.03.2016.
 */
var expect = require('chai').expect;
var AD = require('../src/AD');

describe('AD testi', function () {
    it('Tüm kullanıcıları bul', function (done) {
        //ad.f_FindUsers(opts);
        done("Henüz tamamlanmadı");
    });

    it('Kullanıcı doğrulandı', function (done) {
        var ad = AD("cem.topkaya@fresenius.com.tr", "q1w2e3r4.");
        var opts = {
            filter: '(&(objectClass=user)(cn=Cem Topkaya))',
            includeMembership: ['user'],
            attributes: ['cn', 'givenName', 'sn', 'description', 'userAccountControl', 'userPrincipalName', 'mail']
        };

        ad.f_Auth()
            .then(function (_adKullanici) {
                console.log("success");
                if (_adKullanici.dn) {
                    kullanici.Id = 0;
                    kullanici.AdiSoyadi = _adKullanici.displayName;
                    kullanici.Providers = {
                        AD: _adKullanici
                    };

                    console.log(JSON.stringify(kullanici));
                    done();
                } else {
                    console.log("Kullanıcı Active Directory'de tanımlı değil!");
                    done("Kullanıcı Active Directory'de tanımlı değil!");
                }
            })
            .fail(function (_err) {
                console.log(JSON.stringify(_err));
                done(_err);
            });
    })
});