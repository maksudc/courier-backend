Vagrant.configure('2') do |config|
  config.vm.box = 'fgrehm/trusty64-lxc'
  config.vm.hostname = 'ansible-role-symfony2-ubuntu-trusty64'

  config.vm.synced_folder '.', '/vagrant', disabled: true
  config.vm.synced_folder '.', '/vagrant/ansible-role-phpmyadmin'

  config.vm.provision 'shell' do |s|
    s.keep_color = true
    s.path = 'tests/init.sh'
  end
end
