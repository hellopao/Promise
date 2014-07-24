function isType(obj, type) {
	return Object.prototype.toString.call(obj).toLowerCase().replace(/\[object (\w+)\]/, "$1") === type.toLowerCase();
}
function Promise() {
	this.state = "pending";
	this.handleQueue = [];
}

Promise.prototype.then = function(onFulfilled, onRejected) {
	var handle = {};
	if (isType(onFulfilled, "function")) {
		handle.fulfilled = onFulfilled;
    } else {
        throw "the params of then must be function";
    }

	if (isType(onRejected, "function")) {
		handle.rejected = onRejected;
	} 

	this.handleQueue.push(handle);

	return this;
};

Promise.prototype.resolve = function(value) {
    if (this.state !== "pending") {
        return;
    }

    this.state = "resolved";
    this.handle('resolve',value);
};

Promise.prototype.reject = function(reason) {
    if (this.state !== "pending") {
        return;
    }

    this.state = "rejected";
    this.handle('resolve', reason);
};

Promise.prototype.handle = function (type,value) {
    var firstHandle;
    var handleMap = {
        "resolve": "fulfilled",
        "reject":"rejected"
    };

    while (firstHandle = this.handleQueue.shift()) {
        try {
            var fn = firstHandle[handleMap[type]];
            var result = fn && fn.call(null, value);

            //返回的是一个promise，将后面所有的then挂到该promise后面。
            if (result && result.constructor === Promise) {
                this.handleQueue.forEach(function (handle) {
                    result.then(handle.fulfilled, handle.rejected);
                });
                return result;
            } else {
                //返回的是一个值,就把该值传递给下一个fulfilled或者rejected作为参数
                value = result;
            }
        } catch (e) {
            firstHandle.rejected && firstHandle.rejected(e);
        }
    }
};

Promise.all = function (promises) {
    var resultPromise = new Promise();

    var promiseCount = promises.length;
    var result = [];

    promises.forEach(function (promise, index) {
        promise.then(function (data) {
            result[index] = data;
            promiseCount--;
            if (promiseCount === 0) {
                resultPromise.resolve(result);
            }
        }, function (err) {
            resultPromise.reject(err);
        });
    });

    return resultPromise;
};

Promise.promisify = function () {
    //要promise化的方法
    var fn = fn || [].slice.call(arguments).shift();

    return function () {
        //要promise化的方法接收的参数
        var fnArgs = [].slice.call(arguments);

        var promise = new Promise();
        var handler = function (err, data) {
            if (err) {
                promise.reject(err);
            } else {
                promise.resolve(data);
            }
        }

        //给要promise化的方法添加执行完成事件处理
        fnArgs.push(handler);
        fn.apply(null, fnArgs);

        return promise;
    }
};

module.exports = Promise;