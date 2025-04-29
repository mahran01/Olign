import { ChevronRight } from "@tamagui/lucide-icons";
import { ListItem, YGroup } from "tamagui";

const buildListItem = ({ icon, title, subtitle, onPress, noRightArrow }: any) => (
    <YGroup.Item>
        <ListItem
            hoverTheme
            pressTheme
            icon={icon}
            title={title}
            subTitle={subtitle}
            onPress={onPress}
            iconAfter={noRightArrow ? null : ChevronRight}
            size='$5'
        />
    </YGroup.Item>
);

export default buildListItem;