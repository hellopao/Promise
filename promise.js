var Promise = function() {
    this.state = 'pending';
    this.thens = [];
};

Promise.prototype.then = function(onFulfilled,onRejected) {
    if (typeof onFulfilled === 'function') {
    }

    if (typeof onRejected === 'function') {
    }

    //如果状态不是未完成，就执行结果
    if (this.state !== 'pending') {
        setImmediate(function () {
            this._handleThen();
        }.bind(this));
    }

    var promise = new Promise();

    return promise;
};

Promise.prototype._handleThen = function() {
    
};

/*
 *成功的回调
 */
Promise.prototype.resolve = function() {
    this.state = 'fulfiled';
    return this;
};

/*
 *失败的回调
 */
Promise.prototype.reject = function() {
    this.state = 'rejected';
    return this;
};

Promise.prototype.when = function() {
    
};

/*
 *将一个方法promise化
 */
Promise.prototype.promisefy = function(fn) {
    //要promise化的方法
    var fn = fn || [].slice.call(arguments).shift();

    return function() {
        //要promise化的方法接收的参数
        var fnArgs = [].slice.call(arguments);

        var promise = new Promise();
        var handler = function(err) {
            if (err) {
                return promise.reject(err);
            }
            return promise.resolve([].slice.call(arguments,1));
        }

        //给要promise化的方法添加执行完成事件处理
        fnArgs.push(handler);
        fn.apply(null,fnArgs);

        return promise;
    }
};

module.exports = Promise;

