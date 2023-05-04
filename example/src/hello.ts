#!/usr/bin/env node

import { green } from '@breadc/color';

console.log(`Hello, ${green(process.argv[2] ?? 'unknown')}!`);
