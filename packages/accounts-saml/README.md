# SAML

This package enables SAML authentication for an institute. Change the authentication type to **saml** in the institute admin panel to configure it.

## Technical overview

### SAML Configuration Options

The admin interface for provides several options that must be configured in case an institute wishes to enable SAML:

- SSO Login URL: The login URL of the Identity Provider
- SSO Logout URL: The logout URL of the Identity Provider.
- No logout redirect: A SAML compatible logout page will redirect to the original site after logging out. In case the logout page does not offer this functionality, enable the "no logout redirection" option to ensure the user's session is still destroyed.
- IDP Certificate: Public key/certificate of the IDP.
- Name ID Format: The name ID format. (Optional)
- Auth Context: The auth context format. (Optional)
- Attribute Context: The auth context format. (Optional)
- Attribute Mapping: Allows SAML attributes to be mapped to our internal data model. (Optional)

### saml2 library

This package uses the [saml2](https://github.com/Clever/saml2) library to enable support for SAML. Because of open bugfixes, a patched version of the library is available in the `server/lib` folder.
The patched [saml2.js](saml2.js) file is a Meteor compatible version of the saml2 library. Once PR https://github.com/Clever/saml2/pull/69 is merged, we can directly use the NPM version instead of relying on a local copy.

To make it Meteor compatible, the following changes were applied:

- removed dependency on debug module
- Export classes via Auth.SAML namespace


## Local development setup

To test and debug the SAML implementation locally, it's recommended to run the application as if it's running on `https://university.barco.com`:

- Run the three Meteor applications and set the ROOT_URL environment parameter to `https://university.barco.com`.
- Open your browser and navigate to "Server Settings" in the admin interface (http://localhost:4000/admin/settings)
- Add the SSO Public and Private key for the `university.barco.com` certificate (see [azure-deploy](https://git.barco.com/projects/EDR/repos/azure-deploy/browse) for the keys).
- Install and configure HAProxy (recommended) with the configuration file shown below. (This assumes the "meeting" project runs at port 3003.)
- Copy the `university.barco.com.pem` file from the [azure-deploy](https://git.barco.com/projects/EDR/repos/azure-deploy/browse) repository to `/etc/ssl/private` (this dir is also mentioned in the `haproxy.cfg` file).
- Add the following line to your `/etc/hosts` file: `127.0.0.1  university.barco.com`.
- Open your browser and go to https://university.barco.com

**/etc/haproxy/haproxy.cfg:**
````
global
    log 127.0.0.1   local1 notice
    chroot /var/lib/haproxy
    stats socket /run/haproxy/admin.sock mode 660 level admin
    user haproxy
    group haproxy
    daemon

    # As defined by net.ipv4.ip_local_port_range in sysctl.conf
    maxconn 61439

    # Default SSL material locations
    ca-base /etc/ssl/certs
    crt-base /etc/ssl/private

    # Default ciphers to use on SSL-enabled listening sockets.
    # For more information, see ciphers(1SSL). This list is from:
    #  https://hynek.me/articles/hardening-your-web-servers-ssl-ciphers/
    ssl-default-bind-ciphers ECDH+AESGCM:ECDH+AES256:ECDH+AES128:ECDH+3DES:RSA+AESGCM:RSA+AES:RSA+3DES:!aNULL:!MD5:!DSS
    ssl-default-bind-options no-sslv3 no-tls-tickets

defaults
    log     global
    mode    http

frontend http_university_barco_com
    bind 0.0.0.0:80
    maxconn 61439

    default_backend edu_backend

frontend https_university_barco_com
    bind 0.0.0.0:443 ssl crt university.barco.com.pem
    maxconn 61439

    default_backend edu_backend

backend edu_backend
    balance leastconn
    redirect scheme https if !{ ssl_fc }

    server edu_backend_0 localhost:3003 maxconn 16384 check
````


## Examples

### Kentor

A SAML compatible test environment is available at http://stubidp.kentor.se. This implementation supports both SP initiated login and logout. The site itself contains all the relevant information but the most important information is also mentioned here. Because this is a stubbed SAML implementation, it's not required to add our public key to their metadata.xml. The application can also be ran directly on your localhost and doesn't need an HTTPS proxy.

**Maildomains:** kentor.se (use a random @kentor.se e-mail address when logging in)

**SSO Login URL:** http://stubidp.kentor.se/

**SSO Logout URL:** http://stubidp.kentor.se/Logout

**No logout redirect:** No

**IDP Certificate**:
````
-----BEGIN CERTIFICATE-----
MIIDKTCCAhWgAwIBAgIQoXDqga0edKNDrLX+FDyO1TAJBgUrDgMCHQUAMCYxJDAi
BgNVBAMTG0tlbnRvci5BdXRoU2VydmljZXMuU3R1YklkcDAeFw0xMzEyMjcyMDU0
NDVaFw0zOTEyMzEyMzU5NTlaMCYxJDAiBgNVBAMTG0tlbnRvci5BdXRoU2Vydmlj
ZXMuU3R1YklkcDCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBANAIi7po
3bIVWeoEMIV60qt+MMXeCk4p58+ZqicnPUDyUuWxpft/fp0g4qARxfvJVTHCEJDG
ykaGuX4z3zEhB9tSz8MD7xbqHFrIIp0UJDKZFAl+zQH+eXnvG7h6P0BJR74fvGE6
Y124PRMl/AE9SXwr2T2kr1wS/jO4pBRKo2H5tlhgTfsWSfIkGhvYXu5a1vP7iBqs
wlAzNYLUQI17okQEsli3mVzwfvDHwzOZtjnKIQA/Bs/UA21ZJZm1eGd3VEXw3vWv
34hZXTWe7Hc8eBO8Yip81An+OFVEJ8kshUOtmmVtmZCAMfTq0TOwdfoDnsDHiVFp
3nAS7gdUZ9rOxnECAwEAAaNbMFkwVwYDVR0BBFAwToAQOp8UfulPoU3Zor4hyctW
kaEoMCYxJDAiBgNVBAMTG0tlbnRvci5BdXRoU2VydmljZXMuU3R1YklkcIIQoXDq
ga0edKNDrLX+FDyO1TAJBgUrDgMCHQUAA4IBAQBJN/vhEGjqQn1/lPEqezEiScCo
Rh2ZRBqDHJERAFLzH1DMrfp602NLYOUmbmIWoWjLoen+Pl7MEIF/lyC0WteMOEOk
/pqvFMBrwbRwy1er8LbzMBbPVZaLpN858NOVdpGlilErHPkC9WtS3LIFuBz5/jnI
nC0JkTuf/LJP2g2OeRlJbLFJyxxK4ahTlbabzENe/jgplipDwBosbnLpMmL1B1/v
j+RNHOxxaqhcsmdxhY/Zr34FyXguOLoKx9u/v8XDVB7gf/8ZH6tpMyESy2zeLjbX
i9LRt7GLb5b+Fo4qDXBaTLWvuV9ltftrLkpL1rYToTGRfl+SQke7+kFM7l+N
-----END CERTIFICATE-----
````

**Name ID Format:** `urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress`

**Auth Context:** `urn:oasis:names:tc:SAML:2.0:ac:classes:PasswordProtectedTransport`


### KU Leuven

To enable and test the SAML integration for the KUL, set the following configuration in the admin interface:

**Maildomains:** kuleuven.be

**SSO Login URL:** https://idp.kuleuven.be/idp/profile/SAML2/Redirect/SSO

**SSO Logout URL:** https://idp.kuleuven.be/idp/logout

**No logout redirect:** Yes

**IDP Certificate**:
````
-----BEGIN CERTIFICATE-----
MIIDJzCCAg+gAwIBAgIUJCkaCLjPZevQdbFbyV/aX8+ObfEwDQYJKoZIhvcNAQEF
BQAwGjEYMBYGA1UEAxMPaWRwLmt1bGV1dmVuLmJlMB4XDTEwMTIwNjEwMzY1MFoX
DTMwMTIwNjEwMzY1MFowGjEYMBYGA1UEAxMPaWRwLmt1bGV1dmVuLmJlMIIBIjAN
BgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAoIYa2FxhIfJ7Sy1RhWTmUObGUJRO
WkyRuQ8colNagd7LgtmV1QMtzO7ZBrzUtJYtl65JJdGa0bN3k2UotpvB2qu77n8g
CenFr2QgOxbf+7uadVkxAYaow0GA1u3a9c4TaHn4Y8WazR1SN386VKGwZcKEGGsV
KWnC3gXGLar2p1Oqd69l68nSXQ98O6GgmGbnDVbN/VgNI2Vqe5dpu4tAQQoH6gPH
GPl4xTeffAI/Vcy7OveAEXlz1nGTxJlwZ9/+RmEV8ub553ZYeojaceMqrHDSpkzu
d8fwWsifjdZS7jfxFuhlbiPh67aa4y1jskGmviWOENCNZU246TyPuSE9nQIDAQAB
o2UwYzBCBgNVHREEOzA5gg9pZHAua3VsZXV2ZW4uYmWGJmh0dHBzOi8vaWRwLmt1
bGV1dmVuLmJlL2lkcC9zaGliYm9sZXRoMB0GA1UdDgQWBBQ3Wq3jKozzu+nRqPAm
llWj/cBVAjANBgkqhkiG9w0BAQUFAAOCAQEANGAtqMje2/kEPetXA0AOesJ0OYxh
AaKIAawXwUQcvAEW+uO879UEppsq3VMXrX9VqXrXY47o5B2+/NtvSls7U0FeA/QE
vBEeFteBO7NxKY7VasCCfYI7mT0LUr3MgIPDnENq4ymNyLVgAhxOK4Vu43mtPz8D
+yUwJwUPelIPJsW994v3EXGFSN8XYoxZcWfub41JBTSCcUPEeRllizGgTgFpZdGw
yBBF0f9qs7xieTqsGGijXddW2178IDQV0l3abTnhZZW+FWO5pKOYwkRaLD092RVh
5WD5+lg0EzoMXE00cBUlt6+K8JNWQARxL7MYUMX0ciUUP+XCSFsiYVHX4w==
-----END CERTIFICATE-----
````

**Name ID Format:** `urn:oasis:names:tc:SAML:2.0:nameid-format:transient`

**Auth Context:** `urn:oasis:names:tc:SAML:2.0:ac:classes:PasswordProtectedTransport`

**Attribute Mapping:**
- ID: `urn:mace:kuleuven.be:dir:attribute-def:KULMoreUnifiedUID`
- First name: `urn:oid:2.5.4.42`
- Last name: `urn:oid:2.5.4.4`


#### Credentials and contact information

A test account was provided by the KUL (via philip.brusten@kuleuven.be) that is valid till 30/09/2016:

**Username:** b0017305@kuleuven.be

**Password:** tE9Bsxk8

Profile settings for this account can be configured at https://account.kuleuven.be/login.html.

The IDP metadata can be found at http://shib.kuleuven.be/download/metadata/metadata-kuleuven.xml. Note that the IDP metadata supports the `https://university.barco.com` entity (the certificate is identical to the one from our university.barco.com SSL certificate). If another hostname is used (https://edu.barco.com for example), they'll have to add this entity to the IDP metadata as well. Because this IDP does an explicit check on the entity ID of our application, it's recommended to run the application behind an HTTPS proxy (see above).

For additional information, see http://shib.kuleuven.be.
