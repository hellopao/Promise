function isType(obj,type) {
    return {}.toString.call(obj).toLowerCase().replace(/\[object (\w+)\]/,'$1') === type.toLowerCase();
}


function Promise() {
    this.state = "pending";
    this.thenQueue = [];
}

Promise.prototype.then = function (onFulfilled, onRejected) {
    var thenObj = {};

    if (isType(onFulfilled, 'function')) {
        thenObj.fulfilled = onFulfilled;
    }

    if (isType(onRejected, 'function')) {
        thenObj.rejected = onRejected;
    }

    this.thenQueue.push(thenObj);

    return this;
};

Promise.prototype.resolve = function (data) {
    if (this.state !== "pending") {
        return;
    }

    var thenObj,fn, result;

    while (thenObj = this.thenQueue.shift()) {
        fn = thenObj.fulfilled;
        result = fn && fn.call(null, data);
        if (result && result.constructor === Promise) {
            this.thenQueue.forEach(function (restThen) {
                result.then(restThen.fulfilled, restThen.rejected);
            });
            return result;
        } else {
            data = result;
        }
    }
    
};

Promise.prototype.reject = function (data) {
    if (this.state !== "pending") {
        return;
    }

    var thenObj, fn, result;

    while (thenObj = this.thenQueue.shift()) {
        fn = thenObj.rejected;
        result = fn && fn.call(null, data);
        if (result && result.constructor === Promise) {
            this.thenQueue.forEach(function (restThen) {
                result.then(restThen.fulfilled, restThen.rejected);
            });
            return result;
        } else {
            data = result;
        }
    }
};


Promise.all = function (promises) {
    var resultPromise = new Promise();

    var promiseCount = promises.length;
    var result = [];

    promises.forEach(function (promise,index) {
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
        var handler = function (err,data) {
            if (err) {
                promise.reject(err);
            } else {
                promise.resolve(data);//[].slice.call(arguments, 1));
            }
        }

        //给要promise化的方法添加执行完成事件处理
        fnArgs.push(handler);
        fn.apply(null, fnArgs);

        return promise;
    }
};


module.exports = Promise;


