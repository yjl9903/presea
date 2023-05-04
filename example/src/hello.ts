#!/usr/bin/env node

import { bold } from '@breadc/color';

console.log(`Hello, ${bold(process.argv[2] ?? 'unknown')}!`);
