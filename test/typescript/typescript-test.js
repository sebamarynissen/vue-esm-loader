import semver from 'semver';
import { expect } from 'chai';
import version from '#vue/version';

describe('vue-esm-loader with typescript', function() {

  before(function() {
    this.require = async function(id = this.test.title) {
      let filePath = `./files/${id}`;
      return (await import(filePath)).default;
    };
    this.semver = function(expr) {
      if (!semver.satisfies(version, expr)) {
        this.skip();
      }
    };
  });

  it('imports .vue files that use typescript and composition api', async function() {
    this.semver('>=2.7');

    const Component = await this.require('ts-component-composition.vue');
    expect(Component.render).to.be.ok;
    expect(Component.props).to.have.all.keys('message');
    expect(Component.props.message.required).to.be.true;

  });

  it('imports .vue files that use typescript and options api', async function() {
    this.semver('>=2.7');

    const Component = await this.require('ts-component-options.vue');
    expect(Component.render).to.be.ok;
    expect(Component.props).to.have.all.keys('message');
    expect(Component.props.message.required).to.be.true;

  });

});
