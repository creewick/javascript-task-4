'use strict';

/**
 * Сделано задание на звездочку
 * Реализованы методы several и through
 */
const isStar = true;

const getParts = value =>
    value
        .split('.')
        .map(part => [part])
        .reduce((acc, part) => acc.concat(`${acc[acc.length - 1]}.${part}`))
        .reverse();

function createIfEmpty(delegates, event, context) {
    if (!delegates.has(event)) {
        delegates.set(event, new Map());
    }
    if (!delegates.get(event).has(context)) {
        delegates.get(event).set(context, []);
    }
}

function callOne(record) {
    let times = record.times;
    let called = record.called;
    let frequency = record.frequency;

    if ((times < 1 || called < times) &&
        (frequency < 1 || !(called % frequency))) {
        record.action();
    }
    record.called++;
}

function callAll(delegates, part) {
    if (!delegates.has(part)) {
        return;
    }
    for (const records of delegates.get(part).values()) {
        records.forEach(callOne);
    }
}

function deleteContext(delegates, event, context) {
    for (const key of delegates.keys()) {
        if (key.startsWith(`${event}.`)) {
            delegates.get(key).delete(context);
        }
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
                    called: 0,
                    times: 0,
                    frequency: 0
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
            deleteContext(this.delegates, event, context);

            return this;
        },

        /**
         * Уведомить о событии
         * @param {String} event
         * @returns {Object} this
         */
        emit: function (event) {
            getParts(event)
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
                    called: 0,
                    times,
                    frequency: 0
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
                    called: 0,
                    times: 0,
                    frequency
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
