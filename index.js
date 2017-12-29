import React, { Component } from 'react'
import { withTracker } from 'meteor/react-meteor-data'

const config = {
  loading: <div>loading</div>,
  error: error => <div>{JSON.stringify(error)}</div>
}

const { loading } = config

// Meteor.subscribe wrapper
class WithSubscribe extends Component {
  state = {
    ready: false,
    stop: false,
    error: undefined,
  }

  componentDidMount() {
    this.subscribe()
  }

  componentWillUnmount() {
    this.unsubscribe()
  }

  render() {
    const { ready, stop, error } = this.state
    const { children, loading } = this.props
    if (error)
      return config.error(error)

    if (stop)
      return null

    if (!ready)
      return loading || config.loading

    const props = {
      _subscribeHandler: this.subscribeHandler,
      _subscriptionId: this.subscribeHandler.subscriptionId,
    }

    return children.$$typeof
      ? children
      : children(props)
  }

  getSubscriptionArgs = () => {
    const args = getArgs(this.props)
    const callbackObj = args.slice(-1)
    if (!callbackObj.onStop)
      args.push({ onStop: this.onStop })
    return args
  }

  subscribe = () => {
    const subscriptionArgs = this.getSubscriptionArgs()
    this.trackerHandler = Meteor.autorun(computation => {
      this.subscribeHandler = Meteor.subscribe.apply(Meteor.subscribe, subscriptionArgs)
      const ready = this.subscribeHandler.ready()
      this.setState({ ready })
    })
  }

  unsubscribe = () => {
    if (this.trackerHandler)
      this.trackerHandler.stop()
    if (this.subscribeHandler)
      this.subscribeHandler.stop()
  }

  onStop = error => {
    if (error)
      return this.setState({ error })

    this.setState({ stop: true })
  }
}

// Meteor.autorun wrapper
class WithTracker extends Component {
  state = {
    error: undefined,
    data: {
      list: [],
      item: undefined,
    },
  }

  _data = {}

  componentWillMount() {
    this.resolve()
  }

  componentWillUnmount() {
    if (this.trackerHandler)
      this.trackerHandler.stop()
  }

  render() {
    const { props, state } = this
    const { children } = props
    const { data } = state
    return children({ data })
  }

  resolve = () => {
    const { list, item, data } = this.props

    if (list)
      return this.resolveList()

    if (item)
      return this.resolveItem()

    this.resolveData()
  }

  resolveData = () => {
    const { list, item, data } = this.props
    this.trackerHandler = Meteor.autorun(computation => {
      for (const key in data) {
        const value = this.resolveValue(data[key])
        this.setData(key, value)
      }
      this.setState({ data: this.getData() })
    })
  }

  resolveList = () => {
    const { list } = this.props
    this.trackerHandler = Tracker.autorun(computation => {
      const value = this.resolveValue(list)
      this.setState({ data: { list: value } })
    })
  }

  resolveItem = () => {
    const { item } = this.props
    this.trackerHandler = Meteor.autorun(computation => {
      const value = this.resolveValue(item)
      this.setState({ data: { item: value } })
    })
  }

  resolveValue = value => {
    if (isFunction(value))
      value = value()

    if (value instanceof Mongo.Cursor)
      value = value.fetch()

    return value
  }

  getData = key => {
    if (key)
      return this._data[key]

    return this._data
  }

  setData = (key, value) => {
    this._data[key] = value
  }
}

// Meteor.call wrapper
class WithCall extends Component {
  state = {
    ready: false,
    error: undefined,
    data: undefined,
  }

  componentWillMount() {
    this.resolveCall()
  }

  render() {
    const { ready, error, data } = this.state
    const { children, loading } = this.props

    if (!ready)
      return loading || config.loading

    return (
      children({ data })
    )
  }

  getCallArgs = () => getArgs(this.props)

  resolveCall = () => {
    const callArgs = this.getCallArgs()
    const [callback] = callArgs.slice(-1)

    if (!isFunction(callback))
      callArgs.push(this.callback)

    Meteor.call.apply(Meteor.call, callArgs)
  }

  callback = (error, data) => {
    const ready = true
    error
      ? this.setState({ ready, error })
      : this.setState({ ready, data })
  }
}

// without Meteor.userId wrapper
class WithUserId extends Component {
  state = {
    ready: false,
    userId: null,
  }

  componentWillMount() {
    this.resolveUserId()
  }

  componentWillUnmount() {
    if (this.trackerHandler)
      this.trackerHandler.stop()
  }

  render() {
    const { ready, userId } = this.state
    const { children, loading } = this.props

    if (!userId)
      return null

    if (userId && !ready)
      return loading || config.loading

    return children
  }

  resolveUserId() {
    this.trackerHandler = Meteor.autorun(computation => {
      const userId = Meteor.userId()
      const ready = !Meteor.loggingIn()
      this.setState({ userId, ready })
    })
  }
}

// without Meteor.userId wrapper
class WithoutUserId extends Component {
  state = {
    userId: null,
  }

  componentWillMount() {
    this.resolveUserId()
  }

  componentWillUnmount() {
    if (this.trackerHandler)
      this.trackerHandler.stop()
  }

  render() {
    const { userId } = this.state
    const { children } = this.props

    if (userId)
      return null

    return children
  }

  resolveUserId() {
    this.trackerHandler = Meteor.autorun(computation => {
      const userId = Meteor.userId()
      this.setState({ userId })
    })
  }
}

// Meteor.user() wrapper
class WithUser extends Component {
  state = {
    user: undefined,
  }

  componentWillMount() {
    this.resolveUser()
  }

  componentWillUnmount() {
    if (this.trackerHandler)
      this.trackerHandler.stop()
  }

  render() {
    const { user } = this.state
    const { children } = this.props

    if (!children || children && children.$$typeof) {
      console.error('WithUser\'s children should be a function that return component')
      return null
    }

    if (!user)
      return null

    return children(user)
  }

  resolveUser() {
    this.trackerHandler = Meteor.autorun(computation => {
      const user = Meteor.user()
      this.setState({ user })
    })
  }
}

// utils

function getArgs(props) {
  const { name, args } = props

  if (!name && !isString(name))
    throw new Meteor.Error('name must be specified')

  if (!args)
    return [name]

  if (!Array.isArray(args))
    return [name, args]

  return [name].concat(args)
}

function isString(string) {
  return string && Object.prototype.toString.call(string) === '[object String]' ? true : false
}

function isFunction(fn) {
  return fn && Object.prototype.toString.call(fn) === '[object Function]' ? true : false
}

module.exports = {
  WithSubscribe,
  WithTracker,
  WithCall,
  WithUserId,
  WithoutUserId,
  WithUser,
  config,
}
