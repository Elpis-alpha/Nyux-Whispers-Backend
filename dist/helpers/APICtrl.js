"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.putApiFormData = exports.patchApiFormData = exports.postApiFormData = exports.deleteApiJson = exports.putApiJson = exports.patchApiJson = exports.postApiJson = exports.getApiJson = exports.getToken = void 0;
const getToken = () => {
    return process.env.TOKEN;
};
exports.getToken = getToken;
const protect = (vip) => __awaiter(void 0, void 0, void 0, function* () {
    let validated;
    try {
        validated = yield vip();
    }
    catch (e) {
        validated = { error: "failed to connect" };
    }
    return validated;
});
const getApiJson = (url, token) => __awaiter(void 0, void 0, void 0, function* () {
    return yield protect(() => __awaiter(void 0, void 0, void 0, function* () {
        // check token
        token = token ? token : (0, exports.getToken)();
        const response = yield fetch(url, {
            method: 'GET',
            headers: {
                'Content-type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        const responseJson = yield response.json();
        return responseJson;
    }));
});
exports.getApiJson = getApiJson;
const postApiJson = (url, data = {}, token) => __awaiter(void 0, void 0, void 0, function* () {
    return yield protect(() => __awaiter(void 0, void 0, void 0, function* () {
        // check token
        token = token ? token : (0, exports.getToken)();
        const response = yield fetch(url, {
            method: 'POST',
            headers: {
                'Content-type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });
        const responseJson = yield response.json();
        return responseJson;
    }));
});
exports.postApiJson = postApiJson;
const patchApiJson = (url, data = {}, token) => __awaiter(void 0, void 0, void 0, function* () {
    return yield protect(() => __awaiter(void 0, void 0, void 0, function* () {
        // check token
        token = token ? token : (0, exports.getToken)();
        const response = yield fetch(url, {
            method: 'PATCH',
            headers: {
                'Content-type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });
        const responseJson = yield response.json();
        return responseJson;
    }));
});
exports.patchApiJson = patchApiJson;
const putApiJson = (url, data = {}, token) => __awaiter(void 0, void 0, void 0, function* () {
    return yield protect(() => __awaiter(void 0, void 0, void 0, function* () {
        // check token
        token = token ? token : (0, exports.getToken)();
        const response = yield fetch(url, {
            method: 'PUT',
            headers: {
                'Content-type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });
        const responseJson = yield response.json();
        return responseJson;
    }));
});
exports.putApiJson = putApiJson;
const deleteApiJson = (url, data = {}, token) => __awaiter(void 0, void 0, void 0, function* () {
    return yield protect(() => __awaiter(void 0, void 0, void 0, function* () {
        // check token
        token = token ? token : (0, exports.getToken)();
        const response = yield fetch(url, {
            method: 'DELETE',
            headers: {
                'Content-type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });
        const responseJson = yield response.json();
        return responseJson;
    }));
});
exports.deleteApiJson = deleteApiJson;
const postApiFormData = (url, data = {}, token) => __awaiter(void 0, void 0, void 0, function* () {
    return yield protect(() => __awaiter(void 0, void 0, void 0, function* () {
        // check token
        token = token ? token : (0, exports.getToken)();
        const formData = new FormData();
        for (const name in data) {
            // @ts-ignore
            formData.append(name, data[name]);
        }
        const response = yield fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });
        const responseJson = yield response.json();
        return responseJson;
    }));
});
exports.postApiFormData = postApiFormData;
const patchApiFormData = (url, data = {}, token) => __awaiter(void 0, void 0, void 0, function* () {
    return yield protect(() => __awaiter(void 0, void 0, void 0, function* () {
        // check token
        token = token ? token : (0, exports.getToken)();
        const formData = new FormData();
        for (const name in data) {
            // @ts-ignore
            formData.append(name, data[name]);
        }
        const response = yield fetch(url, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });
        const responseJson = yield response.json();
        return responseJson;
    }));
});
exports.patchApiFormData = patchApiFormData;
const putApiFormData = (url, data = {}, token) => __awaiter(void 0, void 0, void 0, function* () {
    return yield protect(() => __awaiter(void 0, void 0, void 0, function* () {
        // check token
        token = token ? token : (0, exports.getToken)();
        const formData = new FormData();
        for (const name in data) {
            // @ts-ignore
            formData.append(name, data[name]);
        }
        const response = yield fetch(url, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });
        const responseJson = yield response.json();
        return responseJson;
    }));
});
exports.putApiFormData = putApiFormData;
