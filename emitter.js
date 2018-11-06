'use strict';

/**
 * Сделано задание на звездочку
 * Реализованы методы several и through
 */
const isStar = true;

let getParts = value =>
    value
        .split('.')
        .map((_, index, array) =>
            array
                .slice(0, index + 1)
                .join('.'));

function createIfEmpty(delegates, event, context) {
    if (!delegates.has(event)) {
        delegates.set(event, new Map());
    }
    if (!delegates.get(event).has(context)) {
        delegates.get(event).set(context, []);
    }
}

function callAll(delegates, part) {
    if (!delegates.has(part)) {
        return;
    }
    for (var records of delegates.get(part).values()) {
        for (var i = records.length - 1; i >= 0; i--) {
            callOne(records, i);
        }
    }
}

function callOne(records, i) {
    let record = records[i];
    if (--record.wait <= 0 && !records.isEnded) {
        record.wait = record.every;
        record.action();
    }
    if (--record.left === 0) {
        records.isEnded = true;
    }
}

/**
 * Возвращает новый emitter
 * @returns {Object}
 */
function getEmitter() {
    return {

        /**
         * Подписаться на событие
         * @param {String} event
         * @param {Object} context
         * @param {Function} handler
         * @returns {Object} this
         */
        on: function (event, context, handler) {
            createIfEmpty(this.delegates, event, context);
            this.delegates.get(event).get(context)
                .push({
                    action: handler.bind(context),
                    left: 0,
                    wait: 0,
                    every: 0
                });

            return this;
        },

        /**
         * Отписаться от события
         * @param {String} event
         * @param {Object} context
         * @returns {Object} this
         */
        off: function (event, context) {
            if (this.delegates.has(event)) {
                this.delegates.get(event).delete(context);
            }
            for (var key of this.delegates.keys()) {
                if (key.startsWith(`${event}.`)) {
                    this.delegates.get(key).delete(context);
                }
            }

            return this;
        },

        /**
         * Уведомить о событии
         * @param {String} event
         * @returns {Object} this
         */
        emit: function (event) {
            getParts(event)
                .reverse()
                .forEach(part => callAll(this.delegates, part));

            return this;
        },

        /**
         * Подписаться на событие с ограничением по количеству полученных уведомлений
         * @star
         * @param {String} event
         * @param {Object} context
         * @param {Function} handler
         * @param {Number} times – сколько раз получить уведомление
         * @returns {Object} this
         */
        several: function (event, context, handler, times) {
            createIfEmpty(this.delegates, event, context);
            this.delegates.get(event).get(context)
                .push({
                    action: handler.bind(context),
                    left: times,
                    wait: 0,
                    every: 0
                });

            return this;
        },

        /**
         * Подписаться на событие с ограничением по частоте получения уведомлений
         * @star
         * @param {String} event
         * @param {Object} context
         * @param {Function} handler
         * @param {Number} frequency – как часто уведомлять
         * @returns {Object} this
         */
        through: function (event, context, handler, frequency) {
            createIfEmpty(this.delegates, event, context);
            this.delegates.get(event).get(context)
                .push({
                    action: handler.bind(context),
                    left: 0,
                    wait: 0,
                    every: frequency
                });

            return this;
        },

        delegates: new Map()
    };
}

module.exports = {
    getEmitter,

    isStar
};
