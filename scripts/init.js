// Copyright (c) 2019 The arca Authors. All rights reserved.
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this file,
// you can obtain one at http://mozilla.org/MPL/2.0/.

const fs = require('fs')
const Log = require('../lib/logging')
const path = require('path')
const { spawnSync } = require('child_process')
const util = require('../lib/util')

Log.progress('Performing initial checkout of arca-core')

const arcaCoreDir = path.resolve(__dirname, '..', 'src', 'arca')
const arcaCoreRef = util.getProjectVersion('arca-core')

if (!fs.existsSync(path.join(arcaCoreDir, '.git'))) {
  Log.status(`Cloning arca-core [${arcaCoreRef}] into ${arcaCoreDir}...`)
  fs.mkdirSync(arcaCoreDir)
  util.runGit(arcaCoreDir, ['clone', util.getNPMConfig(['projects', 'arca-core', 'repository', 'url']), '.'])
  util.runGit(arcaCoreDir, ['checkout', arcaCoreRef])
}
const arcaCoreSha = util.runGit(arcaCoreDir, ['rev-parse', 'HEAD'])
Log.progress(`arca-core repo at ${arcaCoreDir} is at commit ID ${arcaCoreSha}`)

let npmCommand = 'npm'
if (process.platform === 'win32') {
  npmCommand += '.cmd'
}

util.run(npmCommand, ['install'], { cwd: arcaCoreDir })

util.run(npmCommand, ['run', 'sync' ,'--', '--init'].concat(process.argv.slice(2)), {
  cwd: arcaCoreDir,
  env: process.env,
  stdio: 'inherit',
  shell: true,
  git_cwd: '.', })
