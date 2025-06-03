import React, { useEffect, useState } from 'react';
import type { CustomAttachmentType } from '@/models';
import { CustomTaskAttachment } from './CustomAttachment/CustomTaskAttachment';
import { validate } from '@/utils';
import { StreamCustomAttachmentSchema, TaskAttachmentFetchSchema, TaskAttachmentType } from '@/schemas';
import { useTaskStore } from '@/stores';

const MyCustomCard: any = (data: any) => {
    const validated = validate(StreamCustomAttachmentSchema, data);
    const [attachment, setAttachment] = useState<unknown>(null);
    const fetchTaskAttachment = useTaskStore(e => e.fetchTaskAttachment);

    useEffect(() => {
        const getTaskAttachment = async () => {
            try {
                const result = await fetchTaskAttachment(data.id);
                setAttachment(result);
            } catch (error) {
                console.error("Failed to fetch attachment", error);
            }
        };

        if (validated?.type === "task") {
            getTaskAttachment(); // ✅ don't await here, just call it
        }
    }, [data.id, validated?.type]); // include dependencies if they can change

    if (validated?.type === "task" && attachment) {
        return (
            <CustomTaskAttachment
                taskAttachment={attachment as TaskAttachmentType}
            />
        );
    }

    return null;
};

export default MyCustomCard;