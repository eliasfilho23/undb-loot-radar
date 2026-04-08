import { Delete, Get, Post, Put } from '@nestjs/common';

export const CommandPost   = (command: string) => Post(`/command/${command}`);
export const CommandGet    = (command: string) => Get(`/command/${command}`);
export const CommandPut    = (command: string) => Put(`/command/${command}`);
export const CommandDelete = (command: string) => Delete(`/command/${command}`);
