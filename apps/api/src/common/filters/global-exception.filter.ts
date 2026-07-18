import { ArgumentsHost, Catch, ExceptionFilter, HttpException, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Response } from 'express';

function humanizeField(field: string): string {
  return field.replace(/([A-Z])/g, ' $1').toLowerCase();
}

function mapPrismaError(exception: Prisma.PrismaClientKnownRequestError): { status: number; message: string } {
  switch (exception.code) {
    case 'P2002': {
      const target = exception.meta?.target;
      const fields = Array.isArray(target) ? target.map(humanizeField) : [];
      const suffix = fields.length ? ` (${fields.join(', ')})` : '';
      return { status: 409, message: `Já existe um registro com esses valores${suffix}.` };
    }
    case 'P2025':
      return { status: 404, message: 'Registro não encontrado.' };
    case 'P2003':
      return {
        status: 409,
        message: 'Não é possível concluir a operação: existem registros relacionados.',
      };
    default:
      return { status: 500, message: 'Erro interno no servidor.' };
  }
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  public catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();

    if (exception instanceof HttpException) {
      response.status(exception.getStatus()).json(exception.getResponse());
      return;
    }

    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      const { status, message } = mapPrismaError(exception);
      if (status === 500) {
        this.logger.error(exception.message, exception.stack);
      }
      response.status(status).json({ statusCode: status, message });
      return;
    }

    this.logger.error(exception instanceof Error ? exception.message : exception, (exception as Error)?.stack);
    response.status(500).json({ statusCode: 500, message: 'Erro interno no servidor.' });
  }
}
