/**
 * Created by Charlie on 2017-08-23.
 */

const cssa = angular.module('cssa', []);

cssa.controller('cssaController', function ($scope, $http) {
    $scope.fields = [
        {
            name: "name",
            type: "text",
            data: null
        }, {
            name: "graduation",
            type: "number",
            data: null
        }, {
            name: "email",
            type: "email",
            data: null
        }, {
            name: "phone",
            type: "tel",
            data: null
        }, {
            name: "discipline",
            type: "text",
            data: "disciplines"
        }
    ];

    $http.get('/discipline').then((res) => {
        $scope.dList = res.data;
    });

    $scope.updateUser = function () {
        function handleResponse(res) {
            let originalContent = $scope.message.content || "";
            if (res.data.status !== 0) {
                // Fail
                $scope.message = {
                    type: "error-msg",
                    content: originalContent + "\n" + res.data.error
                };
            } else {
                // Success
                $scope.message = {
                    type: "success-msg",
                    content: originalContent + "\nsuccess!"
                }
            }
        }

        $scope.message = {}; // Clear message box
        console.log($scope.dList.find(d => {
            return d.name === $scope.user.discipline;
        }));
        if ($scope.dList.find(d => {
                return d.name === $scope.user.discipline;
            }) === undefined) {
            $http.post('/discipline', {name: $scope.user.discipline}).then(handleResponse);
        }
        $http.put(`/user/${$scope.openId}`, $scope.user).then(handleResponse);
    }
});