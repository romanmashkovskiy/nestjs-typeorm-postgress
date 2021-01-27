import { Test } from '@nestjs/testing';
import { TasksService } from './tasks.service';
import { TaskRepository } from './task.repository';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';
import { TasksStatus } from './task-status.enum';
import { NotFoundException } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';

const mockTaskRepository = () => ({
  getTasks: jest.fn(),
  findOne: jest.fn(),
  createTask: jest.fn(),
  delete: jest.fn(),
  update: jest.fn(),
});

const mockUser = { id: 1, username: 'Test user' };

describe('TasksService', () => {
  let tasksService;
  let taskRepository;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        TasksService,
        { provide: TaskRepository, useFactory: mockTaskRepository },
      ],
    }).compile();

    tasksService = await module.get<TasksService>(TasksService);
    taskRepository = await module.get<TaskRepository>(TaskRepository);
  });

  describe('getTasks', () => {
    it('get all tasks from repository', async () => {
      taskRepository.getTasks.mockResolvedValue('some value');

      expect(taskRepository.getTasks).not.toHaveBeenCalled();
      const filters: GetTasksFilterDto = {
        status: TasksStatus.IN_PROGRESS,
        search: 'query',
      };
      const result = await tasksService.getTasks(filters, mockUser);
      expect(taskRepository.getTasks).toHaveBeenCalled();
      expect(result).toEqual('some value');
    });
  });

  describe('getTaskById', () => {
    it('calls taskRepository.findOne() and successfully retrieve and return task', async () => {
      const mockTask = { title: 'test', description: 'test' };
      taskRepository.findOne.mockResolvedValue(mockTask);

      const result = await tasksService.getTaskById(1, mockUser);
      expect(taskRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1, userId: mockUser.id },
      });
      expect(result).toEqual(mockTask);
    });

    it('throws an error as task is not found', () => {
      taskRepository.findOne.mockResolvedValue(null);
      expect(tasksService.getTaskById(1, mockUser)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('createTask', () => {
    it('creates new task', async () => {
      const mockValue = 'value';

      taskRepository.createTask.mockResolvedValue(mockValue);

      const newTask: CreateTaskDto = {
        title: 'test',
        description: 'test',
      };

      const result = await tasksService.createTask(newTask, mockUser);
      expect(taskRepository.createTask).toHaveBeenCalledWith(newTask, mockUser);
      expect(result).toEqual(mockValue);
    });
  });

  describe('deleteTask', () => {
    it('calls taskRepository.delete and successfully delete task', async () => {
      taskRepository.delete.mockResolvedValue({ affected: 1 });
      await tasksService.deleteTaskById(1, mockUser);
      expect(taskRepository.delete).toHaveBeenCalledWith({
        id: 1,
        userId: mockUser.id,
      });
    });

    it('throw an error as task is not found', () => {
      taskRepository.delete.mockResolvedValue({ affected: 0 });
      expect(tasksService.deleteTaskById(1, mockUser)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateTaskStatusById', () => {
    it('calls taskRepository.update and successfully update and return task', async () => {
      const mockTask = 'value';
      taskRepository.update.mockResolvedValue({ affected: 1 });
      taskRepository.findOne.mockResolvedValue(mockTask);
      const result = await tasksService.updateTaskStatusById(
        1,
        TasksStatus.DONE,
        mockUser,
      );
      expect(taskRepository.update).toHaveBeenCalledWith(
        { id: 1, userId: mockUser.id },
        { status: TasksStatus.DONE },
      );
      expect(result).toEqual(mockTask);
    });

    it('throws an error as task is not found', () => {
      taskRepository.update.mockResolvedValue({ affected: 0 });
      expect(
        tasksService.updateTaskStatusById(1, TasksStatus.DONE, mockUser),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
