import { Delete, Get, Post, Put } from '@nestjs/common';

export const ApiPost   = (route: string) => Post(`/api/${route}`);
export const ApiGet    = (route: string) => Get(`/api/${route}*`);
export const ApiPut    = (route: string) => Put(`/api/${route}`);
export const ApiDelete = (route: string) => Delete(`/api/${route}`);
