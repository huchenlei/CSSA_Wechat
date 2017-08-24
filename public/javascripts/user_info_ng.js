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
                    content: originalContent + "\n" + JSON.stringify(res.data.error)
                };
            } else {
                // Success
                if (!($scope.message && $scope.message.type === "error-msg")) {
                    $scope.message = {
                        type: "success-msg",
                        content: "success!"
                    }
                }
            }
        }

        if ($scope.dList.find(d => {
                return d.name === $scope.user.discipline;
            }) === undefined) {
            let d = {name: $scope.user.discipline};
            $scope.dList.push(d); // Add new discipline locally
            $http.post('/discipline', d).then(handleResponse);
        }
        $http.put(`/user/${$scope.openId}`, $scope.user).then(handleResponse);

        // The info message will last 5s
        setTimeout(function () {
            $scope.message = {};
        }, 5000);
    }
});