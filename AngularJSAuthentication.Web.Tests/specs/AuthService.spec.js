describe('Authentication Service', function() {

    var authService, serviceBase, localStorageServiceMock, $httpBackend;

    beforeEach(module('AngularAuthApp'));

    beforeEach(inject(function(_$httpBackend_, _authService_, ngAuthSettings, localStorageService) {
        $httpBackend = _$httpBackend_;
        authService = _authService_;
        serviceBase = ngAuthSettings.apiServiceBaseUri;
        localStorageServiceMock = sinon.mock(localStorageService);
    }));

    describe('Login', function() {

        it('Should authenticate with grant type "password", username, password and client id', function() {
            $httpBackend.expectPOST(serviceBase + 'token').respond(201, {access_token: '12345', userName: 'John'});

            authService.login({ userName: 'John', password: 'sEcretHere', useRefreshTokens: false });
            $httpBackend.flush();

            expect(authService.authentication.isAuth).to.equal(true);
        });

        it('Should not authenticate in case there are some error communicating to server', function() {
            $httpBackend.expectPOST(serviceBase + 'token').respond(500);

            authService.login({ userName: 'John', password: 'sEcretHere', useRefreshTokens: false });
            $httpBackend.flush();

            expect(authService.authentication.isAuth).to.equal(false);
        });

        it('Should save authorization data to local storage', function(done) {
            $httpBackend.expectPOST(serviceBase + 'token').respond(201, {access_token: '12345', userName: 'John'});

            localStorageServiceMock
                .expects('set')
                .withArgs('authorizationData', { token: '12345', userName: 'John', refreshToken: "", useRefreshTokens: false })
                .once();

            authService.login({ userName: 'John', password: 'sEcretHere', useRefreshTokens: false }).then(function(response) {
                localStorageServiceMock.verify();
                done();
            });

            $httpBackend.flush();
        });

        it('Should remove authorization data from local storage in case of error on login', function(done) {
            $httpBackend.expectPOST(serviceBase + 'token').respond(500);

            localStorageServiceMock
                .expects('set')
                .never();

            localStorageServiceMock
                .expects('remove')
                .withArgs('authorizationData')
                .once();

            authService.login({ userName: 'John', password: 'sEcretHere', useRefreshTokens: false }).finally(function() {
                localStorageServiceMock.verify();
                done();
            });

            $httpBackend.flush();
        });
    });

    describe('Registration', function() {

        it('Should logout before registering user', function() {
            authService.authentication.isAuth = true;

            authService.saveRegistration({});

            expect(authService.authentication.isAuth).to.equal(false);
        });

    });
});