### USAGE

```javascript
import React, { Component } from 'react'
import { render } from 'react-dom'

import { WithSubscribe, WithTracker, WithCall } from 'meteor/crapthings:react-meteor-components'
console.log(WithSubscribe)

const Demo1 = () => {
  return (
    <div>
      <h3>subscribe to an reactive list</h3>
      <WithSubscribe name='users'>
        <WithTracker list={props => Users.find()}>
          {({ data: { list: users } }) => (
            users.map(({ _id, name }) => (
              <div key={_id}>{name}</div>
            ))
          )}
        </WithTracker>
      </WithSubscribe>
    </div>
  )
}

const Demo2 = () => {
  return (
    <div>
      <h3>subscribe to an reactive item</h3>
      <WithSubscribe name='user'>
        <WithTracker item={props => Users.findOne()}>
          {({ data: { item: { _id, name} } }) => (
            <div>{name}</div>
          )}
        </WithTracker>
      </WithSubscribe>
    </div>
  )
}

const Demo3 = () => {
  return (
    <div>
      <h3>tracker with data props</h3>
      <WithSubscribe name='users'>
        <WithTracker data={{
          title: 'this is a title',
          users: props => Users.find(),
        }}>
          {({ data: { title, users } }) => (
            <div>
              <h4>{title}</h4>
              {users.map(({ _id, name }) => (
                <div key={_id}>{name}</div>
              ))}
            </div>
          )}
        </WithTracker>
      </WithSubscribe>
    </div>
  )
}

const Demo4 = () => {
  return (
    <div>
      <h3>meteor call</h3>
      <WithCall name='users'>
        ?
      </WithCall>
    </div>
  )
}

const Example = () => <div id='example-wrapper'>
  <Demo1 />
  <Demo2 />
  <Demo3 />
  <Demo4 />
</div>

Meteor.startup(function () {
  const app = document.createElement('div')
  app.id = 'app-wrapper'
  document.body.appendChild(app)
  render(<Example />, app)
})
```
