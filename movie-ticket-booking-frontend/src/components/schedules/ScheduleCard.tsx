import React from 'react';
import { Link } from 'react-router-dom';
import type { Schedule } from '../../types';
import { Card, Button } from '../ui';
import { formatDateTime, formatCurrency } from '../../utils';

interface ScheduleCardProps {
  schedule: Schedule;
  onEdit?: (schedule: Schedule) => void;
  onDelete?: (schedule: Schedule) => void;
  onToggleStatus?: (schedule: Schedule) => void;
  showActions?: boolean;
}

const ScheduleCard: React.FC<ScheduleCardProps> = ({
  schedule,
  onEdit,
  onDelete,
  onToggleStatus,
  showActions = true
}) => {
  const showTime = new Date(schedule.showTime);
  const isUpcoming = showTime > new Date();
  const isPast = showTime < new Date();

  const seatUtilization = ((schedule.totalSeats - schedule.availableSeats) / schedule.totalSeats) * 100;

  return (
    <Card className="schedule-card group" padding="lg">
      <div className="space-y-4">
        {/* Schedule Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {schedule.movie.title}
            </h3>
            <p className="text-sm text-gray-600 mb-2">
              at {schedule.theater.name}
            </p>
            <div className="flex items-center gap-2">
              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${schedule.active
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
                }`}>
                {schedule.active ? 'Active' : 'Inactive'}
              </span>
              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${isUpcoming
                ? 'bg-blue-100 text-blue-800'
                : isPast
                  ? 'bg-gray-100 text-gray-800'
                  : 'bg-yellow-100 text-yellow-800'
                }`}>
                {isUpcoming ? 'Upcoming' : isPast ? 'Past' : 'Live'}
              </span>
            </div>
          </div>
          <div className="text-right text-sm text-gray-500">
            <p>ID: {schedule.id}</p>
          </div>
        </div>

        {/* Schedule Details */}
        <div className="space-y-3">
          {/* Show Time and Price */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex items-center text-gray-600">
              <span className="mr-2">🕐</span>
              <div>
                <p className="font-medium text-gray-900">
                  {formatDateTime(schedule.showTime)}
                </p>
                <p className="text-xs">Show time</p>
              </div>
            </div>

            <div className="flex items-center text-gray-600">
              <span className="mr-2">💰</span>
              <div>
                <p className="font-medium text-gray-900">
                  {formatCurrency(schedule.price)}
                </p>
                <p className="text-xs">Ticket price</p>
              </div>
            </div>
          </div>

          {/* Seats and Screen */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex items-center text-gray-600">
              <span className="mr-2">💺</span>
              <div>
                <p className="font-medium text-gray-900">
                  {schedule.availableSeats} / {schedule.totalSeats}
                </p>
                <p className="text-xs">Available / Total seats</p>
              </div>
            </div>

            {schedule.screenNumber && (
              <div className="flex items-center text-gray-600">
                <span className="mr-2">🎪</span>
                <div>
                  <p className="font-medium text-gray-900">
                    Screen {schedule.screenNumber}
                  </p>
                  <p className="text-xs">Theater screen</p>
                </div>
              </div>
            )}
          </div>

          {/* Seat Utilization Bar */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-gray-600">Seat Utilization</span>
              <span className="text-xs font-medium text-gray-900">
                {seatUtilization.toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${seatUtilization >= 80
                  ? 'bg-red-500'
                  : seatUtilization >= 50
                    ? 'bg-yellow-500'
                    : 'bg-green-500'
                  }`}
                style={{ width: `${seatUtilization}%` }}
              />
            </div>
          </div>

          {/* Additional Info */}
          {schedule.additionalInfo && (
            <div className="text-sm">
              <p className="text-gray-700 line-clamp-2">{schedule.additionalInfo}</p>
            </div>
          )}

          {/* Movie Info */}
          <div className="text-xs text-gray-500 pt-2 border-t border-gray-100">
            <p>Movie: {schedule.movie.genre} • {schedule.movie.duration} min</p>
            <p>Theater: {schedule.theater.city}, {schedule.theater.state}</p>
          </div>
        </div>

        {/* Actions */}
        {showActions && (
          <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200">
            <Link
              to={`/theater-owner/schedules/${schedule.id}`}
              className="flex-1 min-w-0"
            >
              <Button
                variant="primary"
                size="sm"
                className="w-full"
              >
                View Details
              </Button>
            </Link>

            {onEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(schedule)}
                className="flex-1 min-w-0"
              >
                Edit
              </Button>
            )}

            {onToggleStatus && (
              <Button
                variant={schedule.active ? "danger" : "success"}
                size="sm"
                onClick={() => onToggleStatus(schedule)}
                className="flex-1 min-w-0"
              >
                {schedule.active ? 'Deactivate' : 'Activate'}
              </Button>
            )}

            {onDelete && (
              <Button
                variant="danger"
                size="sm"
                onClick={() => onDelete(schedule)}
                className="flex-1 min-w-0"
              >
                Delete
              </Button>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};

export default ScheduleCard;